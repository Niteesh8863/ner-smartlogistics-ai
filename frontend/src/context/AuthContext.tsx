import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ner_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('ner_access_token');
      if (storedToken) {
        try {
          const res = await api.get<User>('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.warn("Stored token is invalid or expired. Logging out.");
          localStorage.removeItem('ner_access_token');
          localStorage.removeItem('ner_refresh_token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', {
        username_or_email: usernameOrEmail,
        password: password
      });

      const data = res.data;
      localStorage.setItem('ner_access_token', data.access_token);
      localStorage.setItem('ner_refresh_token', data.refresh_token);
      setToken(data.access_token);

      const userObj: User = {
        id: data.user_id,
        email: data.email,
        username: data.email.split('@')[0],
        full_name: data.full_name,
        role: data.role as UserRole,
        department: data.department,
        state: data.state,
        district: data.district
      };
      setUser(userObj);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('ner_access_token');
    localStorage.removeItem('ner_refresh_token');
    setUser(null);
    setToken(null);
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole
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

