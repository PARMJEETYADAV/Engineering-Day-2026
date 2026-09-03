import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const activeToken = localStorage.getItem('token');
      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string, expectedRole?: string) => {
    try {
      const res = await api.post('/auth/login', { email, password, expectedRole });
      if (res.data?.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err: any) {
      if (!err.response || err.message === 'Network Error') {
        return {
          success: false,
          message: 'Cannot reach backend server. Please verify your backend API is deployed and VITE_API_URL is configured.',
        };
      }
      if (err.response?.status === 404) {
        return {
          success: false,
          message: 'Backend API endpoint not found. Please ensure the backend server is running and VITE_API_URL points to the backend.',
        };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to authenticate. Please check credentials.',
      };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err: any) {
      if (!err.response || err.message === 'Network Error') {
        return {
          success: false,
          message: 'Cannot reach backend server. Please verify your backend API is running and VITE_API_URL is set.',
        };
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = !!(user && ['ADMIN', 'SUPER_ADMIN', 'EVENT_COORDINATOR'].includes(user.role));
  const isStudent = !!(user && user.role === 'STUDENT');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
