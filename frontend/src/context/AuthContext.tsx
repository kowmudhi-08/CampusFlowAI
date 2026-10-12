import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi } from '../api/endpoints';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdminSetupRequired: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  checkAdminSetup: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campusflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('campusflow_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdminSetupRequired, setIsAdminSetupRequired] = useState<boolean>(false);

  const checkAdminSetup = async (): Promise<boolean> => {
    try {
      const res = await authApi.getAdminSetupStatus();
      setIsAdminSetupRequired(res.data.setupRequired);
      return res.data.setupRequired;
    } catch {
      return false;
    }
  };

  const refreshUserProfile = async () => {
    if (!token) return;
    try {
      const res = await authApi.getMe();
      const updatedUser: User = {
        id: res.data.id,
        fullName: res.data.fullName,
        email: res.data.email,
        role: res.data.role,
        active: res.data.active,
        profileId: res.data.profileId,
      };
      setUser(updatedUser);
      localStorage.setItem('campusflow_user', JSON.stringify(updatedUser));
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkAdminSetup();
      if (token) {
        await refreshUserProfile();
      }
      setIsLoading(false);
    };
    init();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('campusflow_token', newToken);
    localStorage.setItem('campusflow_user', JSON.stringify(newUser));
    setIsAdminSetupRequired(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('campusflow_token');
    localStorage.removeItem('campusflow_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user ? user.role : null,
        isAuthenticated: !!token && !!user,
        isLoading,
        isAdminSetupRequired,
        login,
        logout,
        refreshUserProfile,
        checkAdminSetup,
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
