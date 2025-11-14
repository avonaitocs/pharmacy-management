// App.tsx - Refactored with Firebase Authentication and Firestore
import React, { useState, useEffect, useMemo } from 'react';
import LoginPage from './components/LoginPage';
import DashboardPage from './DashboardPage';
import ForcePasswordChangePage from './components/ForcePasswordChangePage';
import EmailCapturePage from './components/EmailCapturePage';
import Confetti from './components/Confetti';
import LoadingSpinner from './components/LoadingSpinner';
import { InitialSetup } from './components/InitialSetup';
import { useAuth } from './hooks/useAuth';
import DevTools from './components/DevTools';
import {
  useTasks,
  useMessages,
  useKnowledgeResources,
  useFolders,
  useUsers,
} from './hooks/useFirestore';
import {
  Task,
  TaskStatus,
  TaskPriority,
  RecurrenceFrequency,
  UserRole,
  TaskComment,
  ChecklistItem,
  UserStatus,
  Message,
  MessageRecipient,
  KnowledgeResource,
  Folder,
} from './types';

const App: React.FC = () => {
  // Authentication
  const { user: currentUser, loading: authLoading, signIn, logOut } = useAuth();

  
  // Data hooks (only load when user is authenticated)
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask } = useTasks(
    currentUser?.id || null,
    currentUser?.role || null
  );

  const { messages, loading: messagesLoading, sendMessage, updateMessage, deleteMessage } =
    useMessages(currentUser?.id || null);

  const {
    resources: knowledgeResources,
    loading: resourcesLoading,
    addResource,
    updateResource,
    deleteResource,
  } = useKnowledgeResources();

  const { folders, loading: foldersLoading, addFolder, updateFolder, deleteFolder } = useFolders();

  const { users, loading: usersLoading, updateUser } = useUsers();

  // Local state
  const [showConfetti, setShowConfetti] = useState(false);
  const [newlyCompletedTasks, setNewlyCompletedTasks] = useState<Task[] | null>(null);

    // Calculate user streaks
  const streaks = useMemo(() => {
    const streakData: { [userId: string]: { count: number; lastCompletionDate: string } } = {};
    
    users.forEach(user => {
      const userCompletedTasks = tasks
        .filter(t => 
          t.assigneeIds.includes(user.id) && 
          t.status === TaskStatus.Done && 
          t.completedAt
        )
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
      
      if (userCompletedTasks.length > 0) {
        let streakCount = 0;
        let lastDate: Date | null = null;
        
        for (const task of userCompletedTasks) {
          const taskDate = new Date(task.completedAt!);
          taskDate.setHours(0, 0, 0, 0);
          
          if (!lastDate) {
            lastDate = taskDate;
            streakCount = 1;
          } else {
            const dayDiff = Math.floor((lastDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
              streakCount++;
              lastDate = taskDate;
            } else if (dayDiff > 1) {
              break;
            }
          }
        }
        
        streakData[user.id] = {
          count: streakCount,
          lastCompletionDate: userCompletedTasks[0].completedAt!
        };
      } else {
        streakData[user.id] = { count: 0, lastCompletionDate: '' };
      }
    });
    
    return streakData;
  }, [tasks, users]);

  // Check for newly completed tasks on login
  useEffect(() => {
    if (currentUser && currentUser.role === UserRole.Admin && currentUser.lastLogin) {
      const lastLoginDate = new Date(currentUser.lastLogin);
      const completedSinceLastLogin = tasks.filter(
        (task) =>
          task.status === TaskStatus.Done &&
          task.completedAt &&
          new Date(task.completedAt) > lastLoginDate
      );
      if (completedSinceLastLogin.length > 0) {
        setNewlyCompletedTasks(completedSinceLastLogin);
      }
    }
  }, [currentUser, tasks]);

  // Update theme based on user preference
  useEffect(() => {
    if (currentUser?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentUser?.theme]);

  // Handler: Login
  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
  };

  // Handler: Logout
  const handleLogout = async () => {
    await logOut();
  };

  // Handler: Password change (for force password change)
  const handlePasswordChange = async (userId: string, newPassword: string) => {
    if (currentUser) {
      await updateUser(userId, { forcePasswordChange: false });
    }
  };

  // Handler: Email submission
  const handleEmailSubmit = async (userId: string, email: string) => {
    await updateUser(userId, { email });
    setShowConfetti(true);
  };

  // Handler: Add user (Admin only)
  const handleAddUser = async (newUserData: any) => {
    console.log('Add user:', newUserData);
    // Implementation: Create user via Cloud Function or Admin SDK
  };

  // Handler: Update user
  const handleUpdateUser = async (updatedUser: any) => {
    await updateUser(updatedUser.id, updatedUser);
  };

  // Handler: Update user status
  const handleUpdateUserStatus = async (userId: string, status: UserStatus) => {
    await updateUser(userId, { status });
  };

  // Handler: Change password
  const handleChangePassword = async (
    userId: string,
    oldPass: string,
    newPass: string
  ): Promise<boolean> => {
    try {
      // This should use the changePassword method from useAuth
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handler: Add task
  const handleAddTask = async (newTaskData: any) => {
    const taskToAdd = {
      ...newTaskData,
      status:
        currentUser?.role === UserRole.Admin ? TaskStatus.ToDo : TaskStatus.PendingApproval,
      createdBy: currentUser?.id || '',
    };
    await addTask(taskToAdd);
  };

  // Handler: Update task
  const handleUpdateTask = async (updatedTask: Task) => {
    const { id, ...updates } = updatedTask;
    await updateTask(id, updates);
  };

  // Handler: Toggle checklist item
  const handleToggleChecklistItem = async (taskId: string, checklistItemId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedChecklist = task.checklist.map((item) =>
      item.id === checklistItemId ? { ...item, isCompleted: !item.isCompleted } : item
    );

    const allCompleted = updatedChecklist.every((item) => item.isCompleted);
    const anyCompleted = updatedChecklist.some((item) => item.isCompleted);

    let newStatus = task.status;
    let completedAt = task.completedAt;

    if (allCompleted && task.status !== TaskStatus.Done) {
      newStatus = TaskStatus.Done;
      completedAt = new Date().toISOString();
      setShowConfetti(true);

      // Handle recurring tasks
      if (task.isRecurring && task.recurrenceFrequency) {
        const nextDeadline = new Date(task.deadline);
        switch (task.recurrenceFrequency) {
          case RecurrenceFrequency.Daily:
            nextDeadline.setDate(nextDeadline.getDate() + 1);
            break;
          case RecurrenceFrequency.Weekly:
            nextDeadline.setDate(nextDeadline.getDate() + 7);
            break;
          case RecurrenceFrequency.Biweekly:
            nextDeadline.setDate(nextDeadline.getDate() + 14);
            break;
          case RecurrenceFrequency.Monthly:
            nextDeadline.setMonth(nextDeadline.getMonth() + 1);
            break;
        }

        if (!task.recurrenceEndDate || nextDeadline <= new Date(task.recurrenceEndDate)) {
          await addTask({
            ...task,
            status: TaskStatus.ToDo,
            deadline: nextDeadline.toISOString(),
            checklist: task.checklist.map((item) => ({ ...item, isCompleted: false })),
            completedAt: null,
          });
        }
      }
    } else if (task.status === TaskStatus.ToDo && anyCompleted) {
      newStatus = TaskStatus.InProgress;
    } else if (task.status === TaskStatus.InProgress && !anyCompleted) {
      newStatus = TaskStatus.ToDo;
    }

    await updateTask(taskId, {
      checklist: updatedChecklist,
      status: newStatus,
      completedAt,
    });
  };

  // Handler: Update task status
  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: TaskStatus,
    updatedChecklist?: ChecklistItem[]
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status !== TaskStatus.Done && newStatus === TaskStatus.Done) {
      setShowConfetti(true);
    }

    const updates: any = { status: newStatus };

    if (newStatus === TaskStatus.Done && task.status !== TaskStatus.Done) {
      updates.completedAt = new Date().toISOString();

      // Handle recurring tasks
      if (task.isRecurring && task.recurrenceFrequency) {
        const nextDeadline = new Date(task.deadline);
        switch (task.recurrenceFrequency) {
          case RecurrenceFrequency.Daily:
            nextDeadline.setDate(nextDeadline.getDate() + 1);
            break;
          case RecurrenceFrequency.Weekly:
            nextDeadline.setDate(nextDeadline.getDate() + 7);
            break;
          case RecurrenceFrequency.Biweekly:
            nextDeadline.setDate(nextDeadline.getDate() + 14);
            break;
          case RecurrenceFrequency.Monthly:
            nextDeadline.setMonth(nextDeadline.getMonth() + 1);
            break;
        }

        if (!task.recurrenceEndDate || nextDeadline <= new Date(task.recurrenceEndDate)) {
          await addTask({
            ...task,
            status: TaskStatus.ToDo,
            deadline: nextDeadline.toISOString(),
            checklist: task.checklist.map((item) => ({ ...item, isCompleted: false })),
            completedAt: null,
          });
        }
      }
    } else if (newStatus !== TaskStatus.Done) {
      updates.completedAt = null;
    }

    if (updatedChecklist) {
      updates.checklist = updatedChecklist;
    }

    await updateTask(taskId, updates);
  };

  // Handler: Update task privacy
  const handleUpdateTaskPrivacy = async (taskId: string, isPrivate: boolean) => {
    await updateTask(taskId, { isPrivate });
  };

  // Handler: Update task priority
  const handleUpdateTaskPriority = async (taskId: string, newPriority: TaskPriority) => {
    await updateTask(taskId, { priority: newPriority });
  };

  // Handler: Archive task
  const handleArchiveTask = async (taskId: string, isArchived: boolean) => {
    await updateTask(taskId, { isArchived });
  };

  // Handler: Delete task
  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  // Handler: Add task comment
  const handleAddTaskComment = async (taskId: string, commentData: Omit<TaskComment, 'id'>) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      ...commentData,
    };

    await updateTask(taskId, {
      comments: [...(task.comments || []), newComment],
    });
  };

  // Handler: Send message
  const handleSendMessage = async (newMessageData: Omit<Message, 'id' | 'timestamp'>) => {
    await sendMessage(newMessageData);
  };

  // Handler: Update message status
  const handleUpdateMessageStatus = async (
    messageId: string,
    userId: string,
    updates: Partial<Omit<MessageRecipient, 'userId'>>
  ) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    if (message.senderId === userId && 'isDeleted' in updates) {
      await updateMessage(messageId, { senderDeleted: updates.isDeleted });
    } else {
      const updatedRecipients = message.recipients.map((r) =>
        r.userId === userId ? { ...r, ...updates } : r
      );
      await updateMessage(messageId, { recipients: updatedRecipients });
    }
  };

  // Handler: Permanently delete message
  const handlePermanentlyDeleteMessage = async (messageId: string, userId: string) => {
    await deleteMessage(messageId);
  };

  // Handler: Add knowledge resource
  const handleAddKnowledgeResource = async (resource: Omit<KnowledgeResource, 'id'>) => {
    await addResource(resource);
  };

  // Handler: Update knowledge resource
  const handleUpdateKnowledgeResource = async (resource: KnowledgeResource) => {
    const { id, ...updates } = resource;
    await updateResource(id, updates);
  };

  // Handler: Delete knowledge resource
  const handleDeleteKnowledgeResource = async (resourceId: string) => {
    await deleteResource(resourceId);
  };

  // Handler: Add folder
  const handleAddFolder = async (name: string) => {
    await addFolder(name);
  };

  // Handler: Update folder
  const handleUpdateFolder = async (updatedFolder: Folder) => {
    const { id, ...updates } = updatedFolder;
    await updateFolder(id, updates);
  };

  // Handler: Delete folder
  const handleDeleteFolder = async (folderId: string) => {
    await deleteFolder(folderId);
  };

  // Handler: Welcome modal dismissed
  const handleWelcomeModalDismissed = () => {
    setNewlyCompletedTasks(null);
  };

  // Show loading spinner while authenticating
  if (authLoading) {
    return <LoadingSpinner />;
  }

// Show login page if not authenticated
if (!currentUser) {
  return <LoginPage onLogin={handleLogin} />;
}

  // Force password change if required
  if (currentUser.forcePasswordChange) {
    return (
      <ForcePasswordChangePage
        currentUser={currentUser}
        onPasswordChange={handlePasswordChange}
      />
    );
  }

  // Capture email if missing
  if (!currentUser.email) {
    return (
      <>
        {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
        <EmailCapturePage currentUser={currentUser} onEmailSubmit={handleEmailSubmit} />
      </>
    );
  }

  // Show loading spinner while loading data
  const isLoading =
    tasksLoading || messagesLoading || resourcesLoading || foldersLoading || usersLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Handler: Archive user (wraps updateUserStatus for DashboardPage)
  const handleArchiveUser = async (userId: string, isArchived: boolean) => {
    await handleUpdateUserStatus(userId, isArchived ? UserStatus.Archived : UserStatus.Active);
  };

  // Main dashboard
  return (
    <>
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      <DashboardPage
        currentUser={currentUser}
        onLogout={handleLogout}
        users={users}
        tasks={tasks}
        messages={messages}
        knowledgeResources={knowledgeResources}
        streaks={streaks}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onArchiveUser={handleArchiveUser}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onUpdateTaskPrivacy={handleUpdateTaskPrivacy}
        onUpdateTaskPriority={handleUpdateTaskPriority}
        onArchiveTask={handleArchiveTask}
        onDeleteTask={handleDeleteTask}
        onAddTaskComment={handleAddTaskComment}
        onSendMessage={handleSendMessage}
        onUpdateMessageStatus={handleUpdateMessageStatus}
        onPermanentlyDeleteMessage={handlePermanentlyDeleteMessage}
        onAddKnowledgeResource={handleAddKnowledgeResource}
        onUpdateKnowledgeResource={handleUpdateKnowledgeResource}
        onDeleteKnowledgeResource={handleDeleteKnowledgeResource}
        folders={folders}
        onAddFolder={handleAddFolder}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
      />
    </>
  );
};

export default App;