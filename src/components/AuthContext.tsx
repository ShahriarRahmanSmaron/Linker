import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export type UserRole = 'buyer' | 'manufacturer' | 'admin' | null;

interface User {
  id: number;
  role: UserRole;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, email: string, password?: string) => Promise<User | undefined>;
  signup: (email: string, password: string, role: UserRole, company_name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token invalid
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error("Failed to restore session:", error);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (role: UserRole, email: string, password?: string): Promise<User | undefined> => {
    // Note: 'role' arg is kept for compatibility but the API determines the role
    if (!password) {
      // Fallback for existing mock calls if any remain (should be updated)
      console.warn("Login called without password - legacy mode");
      return;
    }

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser(data.user_profile);
        toast.success(`Welcome back, ${data.user_profile.name || 'User'}!`);
        return data.user_profile;
      } else {
        const error = await response.json();
        toast.error(error.msg || 'Login failed');
        throw new Error(error.msg);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: UserRole, company_name?: string) => {
    try {
      const response = await api.post('/auth/signup', { email, password, role, company_name });

      if (response.ok) {
        toast.success('Account created! Please log in.');
        // Optionally auto-login here
      } else {
        const error = await response.json();
        toast.error(error.msg || 'Signup failed');
        throw new Error(error.msg);
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
    toast.info('Logged out successfully');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated, isLoading }}>
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