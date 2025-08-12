'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, username?: string) => Promise<{ success: boolean; message: string; needsUsername?: boolean }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, country?: string, username?: string) => Promise<{ success: boolean; message: string; username?: string }>;
  confirmSignUp: (email: string, code: string, username?: string) => Promise<{ success: boolean; message: string }>;
  resendConfirmationCode: (email: string, username?: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const signIn = async (email: string, password: string, username?: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
        credentials: 'same-origin'
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        // Check if the error indicates we need a username
        if (data.message && data.message.includes('username')) {
          return { success: false, message: data.message, needsUsername: true };
        }
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      return { success: false, message: 'Sign in failed' };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state
      setUser(null);
      
      // Clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string, 
    country?: string,
    username?: string
  ) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, country, username }),
        credentials: 'same-origin'
      });

      const data = await response.json();

      return { 
        success: data.success, 
        message: data.message,
        username: data.username // Return the generated username
      };
    } catch (error) {
      console.error('Sign up failed:', error);
      return { success: false, message: 'Sign up failed' };
    }
  };

  const confirmSignUp = async (email: string, code: string, username?: string) => {
    try {
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, confirmationCode: code, username }),
        credentials: 'same-origin'
      });

      const data = await response.json();

      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Confirm sign up failed:', error);
      return { success: false, message: 'Email verification failed' };
    }
  };

  const resendConfirmationCode = async (email: string, username?: string) => {
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username }),
        credentials: 'same-origin'
      });

      const data = await response.json();

      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Resend confirmation code failed:', error);
      return { success: false, message: 'Failed to resend confirmation code' };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
        credentials: 'same-origin'
      });

      const data = await response.json();

      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Change password failed:', error);
      return { success: false, message: 'Failed to change password' };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    resendConfirmationCode,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 