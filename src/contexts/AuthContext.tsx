'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useAuthState, useSignInWithGoogle, useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { SpinnerGap } from '@phosphor-icons/react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | undefined;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [user, loading, error] = useAuthState(auth);
  const [signInWithGoogleMutation] = useSignInWithGoogle(auth);
  const [signOutMutation] = useSignOut(auth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await auth._initializationPromise;
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setInitialized(true); // Set to true even on error to prevent infinite loading
      }
    };

    initAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithGoogleMutation();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signOut = async () => {
    try {
      await signOutMutation();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <SpinnerGap className="animate-spin text-blue-500" size={32} weight="bold" />
      </div>
    );
  }

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 