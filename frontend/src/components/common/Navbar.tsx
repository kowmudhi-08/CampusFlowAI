import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User as UserIcon, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
    FACULTY: 'bg-primary-100 text-primary-800 border-primary-200',
    STUDENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900">
          <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-lg tracking-tight font-extrabold text-navy-900">
            CampusFlow <span className="text-primary-600 font-semibold">AI</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-900">{user.fullName}</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>

            <span
              className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                roleColors[user.role] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {user.role}
            </span>

            <Link
              to="/profile"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="My Profile"
            >
              <UserIcon className="w-4 h-4" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
