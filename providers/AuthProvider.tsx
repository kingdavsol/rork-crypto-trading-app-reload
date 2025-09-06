import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    // Mock signup - in production, this would call an API
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
    };
    
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthenticated(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Mock signin - in production, this would call an API
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name: 'User',
    };
    
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return useMemo(() => ({
    user,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
  }), [user, isAuthenticated, signUp, signIn, signOut]);
});