




import React, { useState, useMemo, useEffect } from 'react';
// Fix: Import the shared View type and remove the local definition.
import { User, Task, TaskStatus, UserRole, TaskPriority, Message, MessageRecipient, TaskComment, KnowledgeResource, ChecklistItem, UserStatus, Folder, View } from '../types';
import Header from './Header';
import TaskCard from './TaskCard';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import UserManagement from './UserManagement';
import PlusIcon from './icons/PlusIcon';
import ReportsPage from './ReportsPage';
import ArchivedTasksPage from './ArchivedTasksPage';
import ReminderModal from './ReminderModal';
import UserDetailPage from './UserDetailPage';
import MessagesPage from './MessagesPage';
import ComposeMessageModal from './ComposeMessageModal';
import PendingApprovalPage from './PendingApprovalPage';
import KnowledgeBasePage from './KnowledgeBasePage';
import Sidebar from './Sidebar';
import DailyBriefingModal from './DailyBriefingModal';
import { generateDailyBriefing } from '../services/geminiService';
import DocumentTextIcon from './icons/DocumentTextIcon';
import AccountPage from './AccountPage';
import ToggleSwitch from './ToggleSwitch';
import WelcomeBackModal from './WelcomeBackModal';
import CalendarView from './CalendarView';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import CalendarDaysIcon from './icons/CalendarDaysIcon';


interface DashboardPageProps {
  currentUser: User;
  onLogout: () => void;
  users: User[];
  tasks: Task[];
  messages: Message[];
  knowledgeResources: KnowledgeResource[];
  folders: Folder[];
  newlyCompletedTasks: Task[] | null;
  onWelcomeModalDismissed: () => void;
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onUpdateUserStatus: (userId: string, status: UserStatus) => void;
  onChangePassword: (userId: string, oldPass: string, newPass: string) => boolean;
  onAddTask: (newTask: Omit<Task, 'id' | 'status' | 'isArchived' | 'comments'>) => void;
  onUpdateTask: (task: Task) => void;
  onToggleChecklistItem: (taskId: string, checklistItemId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus, updatedChecklist?: ChecklistItem[]) => void;
  onUpdateTaskPrivacy: (taskId: string, isPrivate: boolean) => void;
  onUpdateTaskPriority: (taskId: string, newPriority: TaskPriority) => void;
  onArchiveTask: (taskId: string, isArchived: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTaskComment: (taskId: string, commentData: Omit<TaskComment, 'id'>) => void;
  onSendMessage: (newMessage: Omit<Message, 'id' | 'timestamp'>) => void;
  onUpdateMessageStatus: (messageId: string, userId: string, updates: Partial<Omit<MessageRecipient, 'userId'>>) => void;
  onPermanentlyDeleteMessage: (messageId: string, userId: string) => void;
  onAddKnowledgeResource: (resource: Omit<KnowledgeResource, 'id'>) => void;
  onUpdateKnowledgeResource: (resource: KnowledgeResource) => void;
  onDeleteKnowledgeResource: (resourceId: string) => void;
  onAddFolder: (name: string) => void;
  onUpdateFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
}

const TaskColumn: React.FC<{ title: string; tasks: Task[]; status: TaskStatus, children: React.ReactNode }> = ({ title, children, status }) => {
  const statusClasses: { [key in TaskStatus]?: string } = {
    [TaskStatus.ToDo]: 'bg-brand-light dark:bg-gray-800',
    [TaskStatus.InProgress]: 'bg-status-inprogress dark:bg-yellow-900/50',
    [TaskStatus.Done]: 'bg-status-done dark:bg-green-900/50',
  };
  const titleClasses: { [key in TaskStatus]?: string } = {
    [TaskStatus.ToDo]: 'text-brand-primary dark:text-brand-light',
    [TaskStatus.InProgress]: 'text-yellow-800 dark:text-yellow-300',
    [TaskStatus.Done]: 'text-green-800 dark:text-green-300',
  }

  return (
    <div className={`flex-1 w-full min-w-[300px] md:max-w-md rounded-xl p-4 ${statusClasses[status] || 'bg-gray-100 dark:bg-gray-800'}`}>
        <h2 className={`text-xl font-bold mb-4 ${titleClasses[status] || 'text-gray-800 dark:text-gray-200'}`}>{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
  );
};

const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  const { 
    currentUser, 
    onLogout, 
    users, 
    tasks, 
    messages,
    knowledgeResources,
    folders,
    newlyCompletedTasks,
    onWelcomeModalDismissed,
    onAddUser, 
    onUpdateUser, 
    onUpdateUserStatus,
    onChangePassword,
    onAddTask,
    onUpdateTask,
    onToggleChecklistItem,
    onUpdateTaskStatus,
    onUpdateTaskPrivacy,
    onUpdateTaskPriority,
    onArchiveTask,
    onDeleteTask,
    onAddTaskComment,
    onSendMessage,
    onUpdateMessageStatus,
    onPermanentlyDeleteMessage,
    onAddKnowledgeResource,
    onUpdateKnowledgeResource,
    onDeleteKnowledgeResource,
    onAddFolder,
    onUpdateFolder,
    onDeleteFolder,
  } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToRemind, setTaskToRemind] = useState<Task | null>(null);
  const [view, setView] = useState<View>('tasks');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [initialRecipients, setInitialRecipients] = useState<User[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [briefingReport, setBriefingReport] = useState<string>('');
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);

  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [myTasksFilterEnabled, setMyTasksFilterEnabled] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'calendar'>('kanban');

  const handleToggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (newlyCompletedTasks && newlyCompletedTasks.length > 0) {
      setIsWelcomeModalOpen(true);
    }
  }, [newlyCompletedTasks]);

  useEffect(() => {
    // If a task is being edited and the main tasks list updates (e.g., new comment),
    // we need to update the task in the modal to reflect the change.
    if (editingTask) {
      const updatedTask = tasks.find(task => task.id === editingTask.id);
      if (updatedTask) {
        setEditingTask(updatedTask);
      } else {
        // Task might have been deleted, so close the modal.
        setEditingTask(null);
      }
    }
  }, [tasks, editingTask]);
  
  const employees = useMemo(() => users.filter(u => u.status === UserStatus.Active), [users]);
    
  const activeTasks = useMemo(() => tasks.filter(task => !task.isArchived && task.status !== TaskStatus.PendingApproval), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter(task => task.isArchived), [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(task => task.status === TaskStatus.PendingApproval), [tasks]);
  
  const filteredTasks = useMemo(() => {
    let tasksToShow;
    if (currentUser.role === UserRole.Admin) {
      tasksToShow = activeTasks;
    } else {
      tasksToShow = activeTasks.filter(task => task.assigneeIds.includes(currentUser.id) || !task.isPrivate);
    }
    
    if (myTasksFilterEnabled) {
        return tasksToShow.filter(task => task.assigneeIds.includes(currentUser.id));
    }

    return tasksToShow;
  }, [currentUser, activeTasks, myTasksFilterEnabled]);

  const unreadMessagesCount = useMemo(() => {
    return messages.filter(msg => 
      msg.recipients.some(r => r.userId === currentUser.id && !r.isRead && !r.isArchived && !r.isDeleted)
    ).length;
  }, [messages, currentUser.id]);

  const priorityOrder: { [key in TaskPriority]: number } = {
    [TaskPriority.Urgent]: 1,
    [TaskPriority.Important]: 2,
    [TaskPriority.General]: 3,
  };
  
  const handleSendReminder = (taskId: string, note: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
          const assignees = users.filter(u => task.assigneeIds.includes(u.id) && u.email);
          if (assignees.length > 0) {
            const recipientDetails = assignees.map(a => `${a.name} (${a.email})`).join(', ');
            alert(`Reminder sent to ${recipientDetails} for task "${task.title}" with note: "${note}"`);
          } else {
            alert("No assignees with email addresses found for this task.");
          }
      }
      setTaskToRemind(null);
  };

  const handleStartMessage = (user: User) => {
    setInitialRecipients([user]);
    setReplyToMessage(null);
    setIsComposeModalOpen(true);
  };

  const handleCompose = () => {
    setInitialRecipients([]);
    setReplyToMessage(null);
    setIsComposeModalOpen(true);
  };

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    setInitialRecipients([]);
    setIsComposeModalOpen(true);
  };
  
  const handleGenerateBriefing = async () => {
    setIsGeneratingBriefing(true);
    setBriefingError(null);
    setBriefingReport('');
    setIsBriefingModalOpen(true);
    try {
      const report = await generateDailyBriefing(tasks, users);
      setBriefingReport(report);
    } catch (err: any) {
      setBriefingError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const handleSendBriefingMessage = (recipientIds: string[], subject: string, body: string) => {
    onSendMessage({
      senderId: currentUser.id,
      recipients: recipientIds.map(id => ({
        userId: id,
        isRead: false,
        isArchived: false,
        isDeleted: false,
      })),
      subject,
      body,
    });
  };

  const handleCloseBriefingModal = () => {
    setIsBriefingModalOpen(false);
    setBriefingError(null);
    setBriefingReport('');
  };

  const tasksByStatus = {
    [TaskStatus.ToDo]: filteredTasks
      .filter(t => t.status === TaskStatus.ToDo)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    [TaskStatus.InProgress]: filteredTasks
      .filter(t => t.status === TaskStatus.InProgress)
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    [TaskStatus.Done]: filteredTasks
      .filter(t => t.status === TaskStatus.Done)
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      }),
  };
  
  const handleViewChange = (newView: View) => {
    setView(newView);
    setSelectedUserForDetails(null);
    setIsSidebarOpen(false);
  }

  // Fix: Add 'account' to the page titles to satisfy the View type.
  const pageTitles: { [key in View]: string } = {
    tasks: 'Task Dashboard',
    users: selectedUserForDetails ? `${selectedUserForDetails.name}'s Tasks` : 'User Management',
    reports: 'Reports Dashboard',
    archives: 'Archived Tasks',
    messages: 'Internal Messaging',
    pending: 'Pending Task Approvals',
    knowledgeBase: 'Knowledge Base',
    account: 'Account Settings',
  };
  
  const ViewToggleButton: React.FC<{
      label: string;
      isActive: boolean;
      onClick: () => void;
      children: React.ReactNode;
    }> = ({ label, isActive, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-brand-primary text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
      aria-label={`Switch to ${label} view`}
      title={`${label} View`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch(view) {
        case 'users':
            if (selectedUserForDetails) {
                return <UserDetailPage 
                    user={selectedUserForDetails}
                    tasks={tasks.filter(t => t.assigneeIds.includes(selectedUserForDetails.id))}
                    onBack={() => setSelectedUserForDetails(null)} 
                />
            }
            return <UserManagement 
                        users={users} 
                        currentUser={currentUser}
                        onAddUser={onAddUser}
                        onUpdateUserStatus={onUpdateUserStatus}
                        onSelectUser={setSelectedUserForDetails}
                        onSendMessageClick={handleStartMessage}
                    />;
        case 'reports':
            return <ReportsPage users={users} tasks={tasks} />;
        case 'archives':
            return <ArchivedTasksPage 
                        archivedTasks={archivedTasks} 
                        users={users} 
                        currentUser={currentUser}
                        onUnarchiveTask={(taskId) => onArchiveTask(taskId, false)}
                        onDeleteTask={onDeleteTask}
                    />;
        case 'messages':
            return <MessagesPage
                        currentUser={currentUser}
                        users={users}
                        messages={messages}
                        onCompose={handleCompose}
                        onReply={handleReply}
                        onUpdateMessageStatus={onUpdateMessageStatus}
                        onPermanentlyDeleteMessage={onPermanentlyDeleteMessage}
                    />;
        case 'pending':
            return <PendingApprovalPage
                        pendingTasks={pendingTasks}
                        users={users}
                        onApproveTask={(taskId) => onUpdateTaskStatus(taskId, TaskStatus.ToDo)}
                        onRejectTask={onDeleteTask}
                    />;
        case 'knowledgeBase':
            return <KnowledgeBasePage
                        currentUser={currentUser}
                        knowledgeResources={knowledgeResources}
                        folders={folders}
                        onAddResource={onAddKnowledgeResource}
                        onUpdateResource={onUpdateKnowledgeResource}
                        onDeleteResource={onDeleteKnowledgeResource}
                        onAddFolder={onAddFolder}
                        onUpdateFolder={onUpdateFolder}
                        onDeleteFolder={onDeleteFolder}
                    />;
        // Fix: Add a case to render the AccountPage component for the 'account' view.
        case 'account':
            return <AccountPage
                        currentUser={currentUser}
                        onUpdateUser={onUpdateUser}
                        onChangePassword={onChangePassword}
                   />;
        case 'tasks':
        default:
             if (taskViewMode === 'calendar') {
                return <CalendarView tasks={filteredTasks} onTaskClick={setEditingTask} />;
            }
            return (
                <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-4">
                    <TaskColumn title="To Do" tasks={tasksByStatus[TaskStatus.ToDo]} status={TaskStatus.ToDo}>
                    {tasksByStatus[TaskStatus.ToDo].map(task => (
                        <TaskCard key={task.id} task={task} onStatusChange={onUpdateTaskStatus} onToggleChecklistItem={onToggleChecklistItem} onPrivacyChange={onUpdateTaskPrivacy} onPriorityChange={onUpdateTaskPriority} onDelete={onDeleteTask} onArchiveTask={() => onArchiveTask(task.id, true)} onEditTask={setEditingTask} onRemind={setTaskToRemind} currentUser={currentUser} users={users} isExpanded={expandedTasks.has(task.id)} onToggleExpand={handleToggleTaskExpansion} />
                    ))}
                    </TaskColumn>
                    <TaskColumn title="In Progress" tasks={tasksByStatus[TaskStatus.InProgress]} status={TaskStatus.InProgress}>
                    {tasksByStatus[TaskStatus.InProgress].map(task => (
                        <TaskCard key={task.id} task={task} onStatusChange={onUpdateTaskStatus} onToggleChecklistItem={onToggleChecklistItem} onPrivacyChange={onUpdateTaskPrivacy} onPriorityChange={onUpdateTaskPriority} onDelete={onDeleteTask} onArchiveTask={() => onArchiveTask(task.id, true)} onEditTask={setEditingTask} onRemind={setTaskToRemind} currentUser={currentUser} users={users} isExpanded={expandedTasks.has(task.id)} onToggleExpand={handleToggleTaskExpansion} />
                    ))}
                    </TaskColumn>
                    <TaskColumn title="Done" tasks={tasksByStatus[TaskStatus.Done]} status={TaskStatus.Done}>
                    {tasksByStatus[TaskStatus.Done].map(task => (
                        <TaskCard key={task.id} task={task} onStatusChange={onUpdateTaskStatus} onToggleChecklistItem={onToggleChecklistItem} onPrivacyChange={onUpdateTaskPrivacy} onPriorityChange={onUpdateTaskPriority} onDelete={onDeleteTask} onArchiveTask={() => onArchiveTask(task.id, true)} onEditTask={setEditingTask} onRemind={setTaskToRemind} currentUser={currentUser} users={users} isExpanded={expandedTasks.has(task.id)} onToggleExpand={handleToggleTaskExpansion} />
                    ))}
                    </TaskColumn>
                </div>
            );
    }
  };


  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header 
        currentUser={currentUser} 
        onLogout={onLogout} 
        onNavigate={handleViewChange} 
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />
       {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            aria-hidden="true"
          ></div>
        )}
      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          currentUser={currentUser}
          activeView={view}
          onViewChange={handleViewChange}
          pendingTasksCount={pendingTasks.length}
          unreadMessagesCount={unreadMessagesCount}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAddTaskClick={() => setIsModalOpen(true)}
        />
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {pageTitles[view]}
            </h1>
            {view === 'tasks' && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">My Tasks</span>
                    <ToggleSwitch 
                        checked={myTasksFilterEnabled} 
                        onChange={setMyTasksFilterEnabled} 
                    />
                </div>
                 <div className="flex items-center space-x-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <ViewToggleButton label="Kanban" isActive={taskViewMode === 'kanban'} onClick={() => setTaskViewMode('kanban')}>
                        <ClipboardDocumentListIcon className="w-5 h-5" />
                    </ViewToggleButton>
                     <ViewToggleButton label="Calendar" isActive={taskViewMode === 'calendar'} onClick={() => setTaskViewMode('calendar')}>
                        <CalendarDaysIcon className="w-5 h-5" />
                    </ViewToggleButton>
                </div>
              </div>
            )}
          </div>
          <div className="flex-grow min-h-0">
             {renderContent()}
          </div>
        </main>
      </div>

      {isWelcomeModalOpen && newlyCompletedTasks && (
        <WelcomeBackModal
          tasks={newlyCompletedTasks}
          users={users}
          onClose={onWelcomeModalDismissed}
        />
      )}

      {isModalOpen && (
        <CreateTaskModal
          onClose={() => setIsModalOpen(false)}
          onAddTask={onAddTask}
          employees={employees}
          currentUser={currentUser}
        />
      )}
      {editingTask && (
        <EditTaskModal
          onClose={() => setEditingTask(null)}
          onUpdateTask={onUpdateTask}
          taskToEdit={editingTask}
          employees={employees}
          onRemind={setTaskToRemind}
          currentUser={currentUser}
          users={users}
          onAddTaskComment={onAddTaskComment}
        />
      )}
      {taskToRemind && (
          <ReminderModal 
              task={taskToRemind}
              assignees={users.filter(u => u.id === taskToRemind.assigneeIds.find(id => u.id === id) && u.email)}
              onClose={() => setTaskToRemind(null)}
              onSendReminder={handleSendReminder}
          />
      )}
      {isComposeModalOpen && (
        <ComposeMessageModal
          currentUser={currentUser}
          allUsers={users}
          initialRecipients={initialRecipients}
          replyToMessage={replyToMessage}
          onClose={() => {
            setIsComposeModalOpen(false);
            setInitialRecipients([]);
            setReplyToMessage(null);
          }}
          onSendMessage={onSendMessage}
        />
      )}
      {isBriefingModalOpen && (
          <DailyBriefingModal 
              report={briefingReport}
              isLoading={isGeneratingBriefing}
              error={briefingError}
              onClose={handleCloseBriefingModal}
              currentUser={currentUser}
              users={users}
              onSendMessage={handleSendBriefingMessage}
          />
      )}

      {view === 'tasks' && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-center space-y-4">
          <button 
              onClick={handleGenerateBriefing}
              className="flex items-center justify-center w-14 h-14 bg-brand-secondary text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary"
              title="Generate Daily Briefing"
          >
              <DocumentTextIcon className="w-7 h-7"/>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-16 h-16 bg-brand-primary text-white rounded-full shadow-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            title="Create New Task"
          >
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;