'use client';

import React, { createContext, useContext, useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  userType: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || 'lush_co_auth_token';
const USER_KEY = 'lush_co_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem(USER_KEY);
        return null;
      }
    }
    return null;
  });

  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  });

  const loading = false;

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { user: userData, token: authToken } = data.data;

        // Store token and user in localStorage
        localStorage.setItem(TOKEN_KEY, authToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setTokenState(authToken);
        setUserState(userData);

        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || 'Login failed. Please check your credentials.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setTokenState(null);
    setUserState(null);
  };

  const setUser = (userData: User | null) => {
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUserState(userData);
    } else {
      localStorage.removeItem(USER_KEY);
      setUserState(null);
    }
  };

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setTokenState(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
