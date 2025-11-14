// hooks/useFirestore.ts - Custom hooks for Firestore data operations
import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db, getOrganizationId } from '../firebase';
import { Task, Message, KnowledgeResource, Folder, User } from '../types';

// Generic hook for real-time Firestore collection
export const useFirestoreCollection = <T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, collectionName), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: T[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error(`Error setting up ${collectionName} listener:`, err);
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
};

// Hook for tasks collection
export const useTasks = (userId: string | null, userRole: string | null) => {
  const orgId = getOrganizationId();
  
  const constraints = userId
    ? [
        where('organizationId', '==', orgId),
        where('isArchived', '==', false),
        orderBy('deadline', 'asc'),
      ]
    : [];

  const { data: tasks, loading, error } = useFirestoreCollection<Task>('tasks', constraints);

  // Filter tasks based on privacy and user permissions
  const filteredTasks = tasks.filter(task => {
    if (!task.isPrivate) return true;
    if (task.createdBy === userId) return true;
    if (task.assigneeIds?.includes(userId || '')) return true;
    return false;
  });

  const addTask = async (taskData: Omit<Task, 'id' | 'isArchived' | 'comments' | 'createdAt'>) => {
    try {
      const taskToAdd = {
        ...taskData,
        organizationId: orgId,
        isArchived: false,
        comments: [],
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'tasks'), taskToAdd);
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  return {
    tasks: filteredTasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
  };
};

// Hook for messages collection
export const useMessages = (userId: string | null) => {
  const orgId = getOrganizationId();
  
  const constraints = userId
    ? [
        where('organizationId', '==', orgId),
        orderBy('timestamp', 'desc'),
      ]
    : [];

  const { data: allMessages, loading, error } = useFirestoreCollection<Message>('messages', constraints);

  // Filter messages where user is sender or recipient
  const messages = allMessages.filter(msg => {
    if (msg.senderId === userId) return true;
    if (msg.recipients?.some(r => r.userId === userId)) return true;
    return false;
  });

  const sendMessage = async (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'messages'), {
        ...messageData,
        organizationId: orgId,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const updateMessage = async (messageId: string, updates: Partial<Message>) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), updates);
    } catch (err) {
      console.error('Error updating message:', err);
      throw err;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    updateMessage,
    deleteMessage,
  };
};

// Hook for knowledge resources collection
export const useKnowledgeResources = () => {
  const orgId = getOrganizationId();
  
  const constraints = [
    where('organizationId', '==', orgId),
    orderBy('createdAt', 'desc'),
  ];

  const { data: resources, loading, error } = useFirestoreCollection<KnowledgeResource>(
    'knowledgeResources',
    constraints
  );

  const addResource = async (resourceData: Omit<KnowledgeResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'knowledgeResources'), {
        ...resourceData,
        organizationId: orgId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding resource:', err);
      throw err;
    }
  };

  const updateResource = async (resourceId: string, updates: Partial<KnowledgeResource>) => {
    try {
      await updateDoc(doc(db, 'knowledgeResources', resourceId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating resource:', err);
      throw err;
    }
  };

  const deleteResource = async (resourceId: string) => {
    try {
      await deleteDoc(doc(db, 'knowledgeResources', resourceId));
    } catch (err) {
      console.error('Error deleting resource:', err);
      throw err;
    }
  };

  return {
    resources,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
  };
};

// Hook for folders collection
export const useFolders = () => {
  const orgId = getOrganizationId();
  
  const constraints = [
    where('organizationId', '==', orgId),
    orderBy('createdAt', 'desc'),
  ];

  const { data: folders, loading, error } = useFirestoreCollection<Folder>(
    'folders',
    constraints
  );

  const addFolder = async (name: string) => {
    try {
      await addDoc(collection(db, 'folders'), {
        name,
        organizationId: orgId,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding folder:', err);
      throw err;
    }
  };

  const updateFolder = async (folderId: string, updates: Partial<Folder>) => {
    try {
      await updateDoc(doc(db, 'folders', folderId), updates);
    } catch (err) {
      console.error('Error updating folder:', err);
      throw err;
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      await deleteDoc(doc(db, 'folders', folderId));
    } catch (err) {
      console.error('Error deleting folder:', err);
      throw err;
    }
  };

  return {
    folders,
    loading,
    error,
    addFolder,
    updateFolder,
    deleteFolder,
  };
};

// Hook for users collection (Admin only)
export const useUsers = () => {
  const orgId = getOrganizationId();
  
  const constraints = [
    where('organizationId', '==', orgId),
    orderBy('name', 'asc'),
  ];

  const { data: users, loading, error } = useFirestoreCollection<User>('users', constraints);

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    updateUser,
  };
};