

import React, { useState, useMemo, useEffect } from 'react';
// Fix: Import UserStatus to check for active users correctly.
import { User, Task, TaskStatus, UserRole, TaskPriority, Message, MessageRecipient, TaskComment, KnowledgeResource, UserStatus, Folder } from './types';
import Header from './components/Header';
import TaskCard from './components/TaskCard';
import CreateTaskModal from './components/CreateTaskModal';
import EditTaskModal from './components/EditTaskModal';
import UserManagement from './components/UserManagement';
import PlusIcon from './components/icons/PlusIcon';
import ReportsPage from './components/ReportsPage';
import ArchivedTasksPage from './components/ArchivedTasksPage';
import ReminderModal from './components/ReminderModal';
import UserDetailPage from './components/UserDetailPage';
import MessagesPage from './components/MessagesPage';
import ComposeMessageModal from './components/ComposeMessageModal';
import PendingApprovalPage from './components/PendingApprovalPage';
import DailyBriefingModal from './components/DailyBriefingModal';
import { generateDailyBriefing } from './/services/geminiService';
import DocumentTextIcon from './components/icons/DocumentTextIcon';
import KnowledgeBasePage from './components/KnowledgeBasePage';
import Sidebar from './components/Sidebar';


interface DashboardPageProps {
  currentUser: User;
  onLogout: () => void;
  users: User[];
  tasks: Task[];
  messages: Message[];
  knowledgeResources: KnowledgeResource[];
  streaks: { [userId: string]: { count: number; lastCompletionDate: string } };
  onAddUser: (newUser: Omit<User, 'id'>) => void;
  folders: Folder[];
  onAddFolder: (name: string) => void;
  onUpdateFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onUpdateUser: (user: User) => void;
  onArchiveUser: (userId: string, isArchived: boolean) => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'status' | 'isArchived' | 'comments' | 'completedAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
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
}

const TaskColumn: React.FC<{ title: string; tasks: Task[]; status: TaskStatus, children: React.ReactNode }> = ({ title, children, status }) => {
  const statusClasses: { [key in TaskStatus]?: string } = {
    [TaskStatus.ToDo]: 'bg-brand-light',
    [TaskStatus.InProgress]: 'bg-status-inprogress',
    [TaskStatus.Done]: 'bg-status-done',
  };
  const titleClasses: { [key in TaskStatus]?: string } = {
    [TaskStatus.ToDo]: 'text-brand-primary',
    [TaskStatus.InProgress]: 'text-yellow-800',
    [TaskStatus.Done]: 'text-green-800',
  }

  return (
    <div className={`flex-1 min-w-[300px] max-w-md rounded-xl p-4 ${statusClasses[status] || 'bg-gray-100'}`}>
        <h2 className={`text-xl font-bold mb-4 ${titleClasses[status] || 'text-gray-800'}`}>{title}</h2>
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
    streaks,
    onAddUser, 
    onUpdateUser, 
    onArchiveUser,
    onAddTask,
    onUpdateTask,
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
    folders,
    onAddFolder,
    onUpdateFolder,
    onDeleteFolder,
  } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToRemind, setTaskToRemind] = useState<Task | null>(null);
  const [view, setView] = useState<'tasks' | 'users' | 'reports' | 'archives' | 'messages' | 'pending' | 'knowledgeBase'>('tasks');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [initialRecipients, setInitialRecipients] = useState<User[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [briefingReport, setBriefingReport] = useState<string>('');
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);

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
  }, [tasks]);
  
  // Fix: Filter employees based on their 'status' instead of a non-existent 'isArchived' property.
  const employees = useMemo(() => users.filter(u => u.role === UserRole.Employee && u.status === UserStatus.Active), [users]);
    
  const activeTasks = useMemo(() => tasks.filter(task => !task.isArchived && task.status !== TaskStatus.PendingApproval), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter(task => task.isArchived), [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(task => task.status === TaskStatus.PendingApproval), [tasks]);
  
  const filteredTasks = useMemo(() => {
    if (currentUser.role === UserRole.Admin) {
      return activeTasks;
    }
    return activeTasks.filter(task => task.assigneeIds.includes(currentUser.id) || !task.isPrivate);
  }, [currentUser, activeTasks]);

  const unreadMessagesCount = useMemo(() => {
    return messages.filter(msg => 
      msg.recipients.some(r => r.userId === currentUser.id && !r.isRead && !r.isArchived && !r.isDeleted)
    ).length;
  }, [messages, currentUser.id]);

  const dailyProgress = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userTasksToday = tasks.filter(task => {
        const deadline = new Date(task.deadline);
        deadline.setHours(0,0,0,0);
        return task.assigneeIds.includes(currentUser.id) && deadline.getTime() === today.getTime()
    });
    
    const completedToday = userTasksToday.filter(t => t.status === TaskStatus.Done);
    
    const progress = {
        [TaskPriority.Urgent]: { total: 0, completed: 0 },
        [TaskPriority.Important]: { total: 0, completed: 0 },
        [TaskPriority.General]: { total: 0, completed: 0 },
    };

    userTasksToday.forEach(task => {
        progress[task.priority].total++;
    });
    completedToday.forEach(task => {
        progress[task.priority].completed++;
    });

    return progress;
  }, [tasks, currentUser.id]);

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
      .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()),
  };
  
  const handleViewChange = (newView: 'tasks' | 'users' | 'reports' | 'archives' | 'messages' | 'pending' | 'knowledgeBase') => {
    setView(newView);
    setSelectedUserForDetails(null);
  }

  const pageTitles = {
    tasks: 'Task Dashboard',
    users: selectedUserForDetails ? `${selectedUserForDetails.name}'s Tasks` : 'User Management',
    reports: 'Reports Dashboard',
    archives: 'Archived Tasks',
    messages: 'Internal Messaging',
    pending: 'Pending Task Approvals',
    knowledgeBase: 'AI Knowledge Base',
  };

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
                        onUpdateUser={onUpdateUser}
                        onArchiveUser={onArchiveUser}
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
                    />
        case 'tasks':
        default:
            return (
                <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
                    <TaskColumn title="To Do" tasks={tasksByStatus[TaskStatus.ToDo]} status={TaskStatus.ToDo}>
                    {tasksByStatus[TaskStatus.ToDo].map(task => (
                        <TaskCard key={task.id} task={task} onStatusChange={onUpdateTaskStatus} onPrivacyChange={onUpdateTaskPrivacy} onPriorityChange={onUpdateTaskPriority} onDelete={onDeleteTask} onArchiveTask={() => onArchiveTask(task.id, true)} onEditTask={setEditingTask} onRemind={setTaskToRemind} currentUser={currentUser} users={users}/>
                    ))}
                    </TaskColumn>
                    <TaskColumn title="In Progress" tasks={tasksByStatus[TaskStatus.InProgress]} status={TaskStatus.InProgress}>
                    {tasksByStatus[TaskStatus.InProgress].map(task => (
                        <TaskCard key={task.id} task={task} onStatusChange={onUpdateTaskStatus} onPrivacyChange={onUpdateTaskPrivacy} onPriorityChange={onUpdateTaskPriority} onDelete={onDeleteTask} onArchiveTask={() => onArchiveTask(task.id, true)} onEditTask={setEditingTask} onRemind={setTaskToRemind} currentUser={currentUser} users={users}/>
                    ))}
                    </TaskColumn>
                    <TaskColumn title="Done" tasks={tasksByStatus[TaskStatus.Done]} status={TaskStatus.Done}>
                    {tasksByStatus[TaskStatus.Done].map(task => (
                        <TaskCard key={task.id} task={task} onStatusChange={onUpdateTaskStatus} onPrivacyChange={onUpdateTaskPrivacy} onPriorityChange={onUpdateTaskPriority} onDelete={onDeleteTask} onArchiveTask={() => onArchiveTask(task.id, true)} onEditTask={setEditingTask} onRemind={setTaskToRemind} currentUser={currentUser} users={users}/>
                    ))}
                    </TaskColumn>
                </div>
            );
    }
  };


  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header currentUser={currentUser} onLogout={onLogout} />
      <div className="flex flex-grow overflow-hidden">
        <Sidebar
          currentUser={currentUser}
          activeView={view}
          onViewChange={handleViewChange}
          pendingTasksCount={pendingTasks.length}
          unreadMessagesCount={unreadMessagesCount}
          dailyProgress={dailyProgress}
          streakCount={streaks[currentUser.id]?.count || 0}
        />
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {pageTitles[view]}
            </h1>
          </div>

          {renderContent()}
        </main>
      </div>
      
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
              assignees={users.filter(u => taskToRemind.assigneeIds.includes(u.id) && u.email)}
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
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-center">
          <button 
              onClick={handleGenerateBriefing}
              className="flex items-center justify-center w-16 h-16 bg-brand-secondary text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary mb-4"
              title="Generate Daily Briefing"
          >
              <DocumentTextIcon className="w-8 h-8"/>
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