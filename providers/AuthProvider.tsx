import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AuthService, { User } from '@/services/AuthService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUpWithEmail: (email: string, name: string) => Promise<{ user: User; needsVerification: boolean }>;
  completeEmailSignUp: (email: string, name: string, verificationCode: string) => Promise<User>;
  signInWithProvider: (provider: 'google' | 'yahoo' | 'x' | 'facebook' | 'instagram') => Promise<User>;
  verifyEmailCode: (email: string, code: string) => Promise<boolean>;
  resendVerificationCode: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = useCallback(async (email: string, name: string) => {
    try {
      setIsLoading(true);
      const result = await AuthService.signUpWithEmail(email, name);
      setUser(result.user);
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeEmailSignUp = useCallback(async (email: string, name: string, verificationCode: string) => {
    try {
      setIsLoading(true);
      const newUser = await AuthService.completeEmailSignUp(email, name, verificationCode);
      setUser(newUser);
      setIsAuthenticated(true);
      return newUser;
    } catch (error) {
      console.error('Complete sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithProvider = useCallback(async (provider: 'google' | 'yahoo' | 'x' | 'facebook' | 'instagram') => {
    try {
      setIsLoading(true);
      const newUser = await AuthService.signInWithProvider(provider);
      setUser(newUser);
      setIsAuthenticated(true);
      return newUser;
    } catch (error) {
      console.error('Social sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmailCode = useCallback(async (email: string, code: string) => {
    try {
      return await AuthService.verifyEmailCode(email, code);
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }, []);

  const resendVerificationCode = useCallback(async (email: string) => {
    try {
      await AuthService.resendVerificationCode(email);
    } catch (error) {
      console.error('Resend verification code error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await AuthService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    signUpWithEmail,
    completeEmailSignUp,
    signInWithProvider,
    verifyEmailCode,
    resendVerificationCode,
    signOut,
  }), [user, isAuthenticated, isLoading, signUpWithEmail, completeEmailSignUp, signInWithProvider, verifyEmailCode, resendVerificationCode, signOut]);
});