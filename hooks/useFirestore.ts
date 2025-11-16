// hooks/useFirestore.ts - Custom hooks for Firestore data operations
// UPDATED: Using nested collection paths for multi-tenant architecture
// SAFE: Handles cases where organization ID might not be available
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

// Helper to safely get organization ID
const safeGetOrganizationId = (): string | null => {
  try {
    return getOrganizationId();
  } catch (error) {
    console.warn('Organization ID not configured yet:', error);
    return null;
  }
};

// Generic hook for real-time Firestore collection
export const useFirestoreCollection = <T extends { id: string }>(
  collectionPath: string | null,
  constraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no collection path, return empty data
    if (!collectionPath) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, collectionPath), ...constraints);

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
          console.error(`Error fetching ${collectionPath}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error(`Error setting up ${collectionPath} listener:`, err);
      setError(err.message);
      setLoading(false);
    }
  }, [collectionPath, JSON.stringify(constraints)]);

  return { data, loading, error };
};

// Hook for tasks collection
export const useTasks = (userId: string | null, userRole: string | null) => {
  const orgId = safeGetOrganizationId();
  
  // Only create path if we have an orgId and userId
  const tasksPath = orgId && userId ? `organizations/${orgId}/tasks` : null;
  
  const constraints = tasksPath
    ? [
        where('isArchived', '==', false),
        orderBy('deadline', 'asc'),
      ]
    : [];

  const { data: tasks, loading, error } = useFirestoreCollection<Task>(tasksPath, constraints);

  // Filter tasks based on privacy and user permissions
  const filteredTasks = tasks.filter(task => {
    if (!task.isPrivate) return true;
    if (task.createdBy === userId) return true;
    if (task.assigneeIds?.includes(userId || '')) return true;
    return false;
  });

  const addTask = async (taskData: Omit<Task, 'id' | 'isArchived' | 'comments' | 'createdAt'>) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      const taskToAdd = {
        ...taskData,
        isArchived: false,
        comments: [],
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, `organizations/${orgId}/tasks`), taskToAdd);
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await updateDoc(doc(db, `organizations/${orgId}/tasks`, taskId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await deleteDoc(doc(db, `organizations/${orgId}/tasks`, taskId));
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
  const orgId = safeGetOrganizationId();
  
  const messagesPath = orgId && userId ? `organizations/${orgId}/messages` : null;
  
  const constraints = messagesPath
    ? [orderBy('timestamp', 'desc')]
    : [];

  const { data: allMessages, loading, error } = useFirestoreCollection<Message>(messagesPath, constraints);

  // Filter messages where user is sender or recipient
  const messages = allMessages.filter(msg => {
    if (msg.senderId === userId) return true;
    if (msg.recipients?.some(r => r.userId === userId)) return true;
    return false;
  });

  const sendMessage = async (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await addDoc(collection(db, `organizations/${orgId}/messages`), {
        ...messageData,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const updateMessage = async (messageId: string, updates: Partial<Message>) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await updateDoc(doc(db, `organizations/${orgId}/messages`, messageId), updates);
    } catch (err) {
      console.error('Error updating message:', err);
      throw err;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await deleteDoc(doc(db, `organizations/${orgId}/messages`, messageId));
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
  const orgId = safeGetOrganizationId();
  
  const resourcesPath = orgId ? `organizations/${orgId}/knowledgeResources` : null;
  
  const constraints = resourcesPath
    ? [orderBy('createdAt', 'desc')]
    : [];

  const { data: resources, loading, error } = useFirestoreCollection<KnowledgeResource>(
    resourcesPath,
    constraints
  );

  const addResource = async (resourceData: Omit<KnowledgeResource, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await addDoc(collection(db, `organizations/${orgId}/knowledgeResources`), {
        ...resourceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding resource:', err);
      throw err;
    }
  };

  const updateResource = async (resourceId: string, updates: Partial<KnowledgeResource>) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await updateDoc(doc(db, `organizations/${orgId}/knowledgeResources`, resourceId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating resource:', err);
      throw err;
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await deleteDoc(doc(db, `organizations/${orgId}/knowledgeResources`, resourceId));
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
  const orgId = safeGetOrganizationId();
  
  const foldersPath = orgId ? `organizations/${orgId}/folders` : null;
  
  const constraints = foldersPath
    ? [orderBy('createdAt', 'desc')]
    : [];

  const { data: folders, loading, error } = useFirestoreCollection<Folder>(
    foldersPath,
    constraints
  );

  const addFolder = async (name: string) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await addDoc(collection(db, `organizations/${orgId}/folders`), {
        name,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding folder:', err);
      throw err;
    }
  };

  const updateFolder = async (folderId: string, updates: Partial<Folder>) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await updateDoc(doc(db, `organizations/${orgId}/folders`, folderId), updates);
    } catch (err) {
      console.error('Error updating folder:', err);
      throw err;
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await deleteDoc(doc(db, `organizations/${orgId}/folders`, folderId));
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
  const orgId = safeGetOrganizationId();
  
  const usersPath = orgId ? `organizations/${orgId}/users` : null;
  
  const constraints = usersPath
    ? [orderBy('name', 'asc')]
    : [];

  const { data: users, loading, error } = useFirestoreCollection<User>(usersPath, constraints);

  const updateUser = async (userId: string, updates: Partial<User>) => {
    if (!orgId) throw new Error('Organization not configured');
    
    try {
      await updateDoc(doc(db, `organizations/${orgId}/users`, userId), updates);
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