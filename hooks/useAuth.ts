// src/hooks/useAuth.ts
// Multi-tenant authentication hook for pharmacy SaaS
// Each organization (pharmacy) is completely isolated via organizationId

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, getOrganizationId } from '../firebase';
import { User, UserStatus } from '../types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase Auth
        // Now load their user document from Firestore
        await loadUserData(firebaseUser);
      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Load user data from Firestore
   * CRITICAL: User document is stored at organizations/{orgId}/users/{userId}
   * This ensures complete data isolation between pharmacies
   */
  const loadUserData = async (firebaseUser: FirebaseUser): Promise<void> => {
    try {
      const orgId = getOrganizationId();
      
      // Build path to user document: organizations/{orgId}/users/{userId}
      const userDocRef = doc(db, 'organizations', orgId, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as User;
        
        // Check if user is active
        if (userData.status === UserStatus.Archived || userData.status === UserStatus.Inactive) {
          throw new Error('Your account is not active. Please contact your administrator.');
        }

        // Update last login timestamp
        const updatedUser = {
          ...userData,
          lastLogin: new Date().toISOString()
        };

        setUser(updatedUser);
        setLoading(false);
      } else {
        // User exists in Firebase Auth but not in Firestore for this organization
        // This prevents users from one pharmacy accessing another pharmacy's system
        throw new Error('User not found in this organization. Please contact your administrator.');
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      // Sign out the user if we can't load their data
      await firebaseSignOut(auth);
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  /**
   * Sign in with email and password
   * After Firebase Auth succeeds, loads user data from organization-specific collection
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Load user data from Firestore (happens automatically via onAuthStateChanged)
      // The onAuthStateChanged listener will call loadUserData()
      
    } catch (error: any) {
      setLoading(false);
      
      // Translate Firebase error codes to user-friendly messages
      let errorMessage = 'An error occurred during sign in.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  /**
   * Sign out the current user
   */
  const logOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  };

  return {
    user,
    loading,
    signIn,
    logOut,
  };
};