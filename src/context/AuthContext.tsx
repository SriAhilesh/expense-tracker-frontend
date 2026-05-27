import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist in local storage on load
    const storedToken = localStorage.getItem('expense_tracker_token');
    const storedUser = localStorage.getItem('expense_tracker_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password: pass });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('expense_tracker_token', access_token);
      localStorage.setItem('expense_tracker_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name?: string) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/signup', { email, password: pass, name });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('expense_tracker_token', access_token);
      localStorage.setItem('expense_tracker_user', JSON.stringify(userData));

      setToken(access_token);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('expense_tracker_token');
    localStorage.removeItem('expense_tracker_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
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
