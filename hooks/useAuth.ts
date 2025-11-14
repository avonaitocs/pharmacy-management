// hooks/useAuth.ts - Custom hook for Firebase Authentication
import { useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, getOrganizationId } from '../firebase';
import { User, UserRole, UserStatus } from '../types';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            const user: User = {
              id: firebaseUser.uid,
              ...userData,
            };
            
            // Update last login
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastLogin: serverTimestamp(),
            });
            
            setAuthState({
              user,
              firebaseUser,
              loading: false,
              error: null,
            });
          } else {
            // User doesn't exist in Firestore
            console.error('User document not found');
            await signOut(auth);
            setAuthState({
              user: null,
              firebaseUser: null,
              loading: false,
              error: 'User data not found',
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setAuthState({
            user: null,
            firebaseUser: null,
            loading: false,
            error: 'Failed to load user data',
          });
        }
      } else {
        setAuthState({
          user: null,
          firebaseUser: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  // Sign up new user
  const signUp = async (
    email: string,
    password: string,
    userData: Omit<User, 'id' | 'email'>
  ): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const newUser: Omit<User, 'id'> = {
        ...userData,
        email,
        organizationId: getOrganizationId(),
        lastLogin: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', userId), newUser);
      await sendEmailVerification(userCredential.user);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw new Error(errorMessage);
    }
  };

  // Sign out
  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!authState.firebaseUser || !authState.user) {
      throw new Error('No user signed in');
    }

    try {
      await signInWithEmailAndPassword(auth, authState.user.email, currentPassword);
      await updatePassword(authState.firebaseUser, newPassword);
      await updateDoc(doc(db, 'users', authState.firebaseUser.uid), {
        forcePasswordChange: false,
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  // Send password reset email
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!authState.user) {
      throw new Error('No user signed in');
    }

    try {
      await updateDoc(doc(db, 'users', authState.user.id), updates);
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  };

  return {
    user: authState.user,
    firebaseUser: authState.firebaseUser,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    logOut,
    changePassword,
    resetPassword,
    updateUserProfile,
  };
};

// Helper function to translate Firebase error codes
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/requires-recent-login':
      return 'Please sign in again to perform this action';
    default:
      return 'An error occurred. Please try again';
  }
};