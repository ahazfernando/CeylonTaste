import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  customerStatus?: string;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export class FirebaseAuthService {
  // Sign up with email and password
  static async signUp(email: string, password: string, name: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      const userData = {
        name,
        email,
        role: 'user',
        customerStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      return {
        id: user.uid,
        ...userData
      } as User;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      return {
        id: user.uid,
        ...userDoc.data()
      } as User;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Update user profile
  static async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updateData,
        updatedAt: new Date()
      });

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      return {
        id: userId,
        ...userDoc.data()
      } as User;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return null;
      }

      return {
        id: userId,
        ...userDoc.data()
      } as User;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}

// API service wrapper - uses Firebase authentication
export const apiAuthService = {
  signUp: async (email: string, password: string, name: string): Promise<{ user: User; token: string }> => {
    try {
      const user = await FirebaseAuthService.signUp(email, password, name);
      // Store user in localStorage for compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('tt_user', JSON.stringify(user));
        localStorage.setItem('tt_token', 'firebase-token'); // Firebase handles auth internally
      }
      return { user, token: 'firebase-token' };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }
  },

  signIn: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    try {
      const user = await FirebaseAuthService.signIn(email, password);
      // Store user in localStorage for compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('tt_user', JSON.stringify(user));
        localStorage.setItem('tt_token', 'firebase-token'); // Firebase handles auth internally
      }
      return { user, token: 'firebase-token' };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await FirebaseAuthService.signOut();
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tt_user');
        localStorage.removeItem('tt_token');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const currentUser = FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        // Check localStorage as fallback
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('tt_user');
          if (userStr) {
            return JSON.parse(userStr);
          }
        }
        return null;
      }
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        return null;
      }

      return {
        id: currentUser.uid,
        ...userDoc.data()
      } as User;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  updateProfile: async (updateData: Partial<User>): Promise<User> => {
    try {
      const currentUser = FirebaseAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const updatedUser = await FirebaseAuthService.updateProfile(currentUser.uid, updateData);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('tt_user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};
