import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PublicRouteProps {
  children?: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, role, isAdminSetupRequired } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAdminSetupRequired) {
    return <Navigate to="/setup-admin" replace />;
  }

  if (isAuthenticated && role) {
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'FACULTY') return <Navigate to="/faculty" replace />;
    if (role === 'STUDENT') return <Navigate to="/student" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

