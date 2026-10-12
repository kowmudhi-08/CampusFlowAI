import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  UserCheck,
  CalendarCheck,
  Award,
  FileText,
  Bell,
  Briefcase,
  BarChart3,
  User,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/students', label: 'Students', icon: GraduationCap },
    { to: '/faculty', label: 'Faculty', icon: Users },
    { to: '/departments', label: 'Departments', icon: Building2 },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/enrollments', label: 'Enrollments', icon: UserCheck },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/examinations', label: 'Examinations', icon: Award },
    { to: '/assignments', label: 'Assignments', icon: FileText },
    { to: '/notices', label: 'Notices', icon: Bell },
    { to: '/placements', label: 'Placements', icon: Briefcase },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const facultyLinks = [
    { to: '/faculty', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Assigned Courses', icon: BookOpen },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/examinations', label: 'Exams & Marks', icon: Award },
    { to: '/assignments', label: 'Assignments', icon: FileText },
    { to: '/notices', label: 'Notices Feed', icon: Bell },
    { to: '/reports', label: 'Class Analytics', icon: BarChart3 },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  const studentLinks = [
    { to: '/student', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/attendance', label: 'My Attendance', icon: CalendarCheck },
    { to: '/examinations', label: 'Exam Results', icon: Award },
    { to: '/assignments', label: 'Assignments', icon: FileText },
    { to: '/placements', label: 'Placement Drives', icon: Briefcase },
    { to: '/notices', label: 'Notices', icon: Bell },
    { to: '/reports', label: 'Performance & AI', icon: BarChart3 },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  let links = adminLinks;
  if (role === 'FACULTY') links = facultyLinks;
  if (role === 'STUDENT') links = studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white shadow-sm">
              CF
            </div>
            <span className="text-base font-bold tracking-tight text-white">CampusFlow AI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {role} Workspace
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin' || link.to === '/faculty' || link.to === '/student'}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-800 text-xs text-slate-400 text-center">
          CampusFlow AI v1.0
        </div>
      </aside>
    </>
  );
};
