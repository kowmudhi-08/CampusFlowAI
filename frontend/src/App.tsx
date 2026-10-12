import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PublicRoute } from './components/routing/PublicRoute';
import { DashboardLayout } from './components/layouts/DashboardLayout';

// Public Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminSetup } from './pages/AdminSetup';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';

// Dashboard Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';

// Module Management Pages
import { StudentsPage } from './pages/students/StudentsPage';
import { FacultyPage } from './pages/faculty/FacultyPage';
import { DepartmentsPage } from './pages/departments/DepartmentsPage';
import { CoursesPage } from './pages/courses/CoursesPage';
import { EnrollmentsPage } from './pages/enrollments/EnrollmentsPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { ExaminationsPage } from './pages/examinations/ExaminationsPage';
import { AssignmentsPage } from './pages/assignments/AssignmentsPage';
import { NoticesPage } from './pages/notices/NoticesPage';
import { PlacementsPage } from './pages/placements/PlacementsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { ProfilePage } from './pages/profile/ProfilePage';

// Root redirect handler based on authenticated user's role
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }


  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'FACULTY') return <Navigate to="/faculty" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student" replace />;

  return <Navigate to="/login" replace />;
};

// Smart handler for /faculty path: shows FacultyDashboard for faculty, FacultyPage for admin
const FacultySmartRoute: React.FC = () => {
  const { role } = useAuth();
  if (role === 'ADMIN') {
    return <FacultyPage />;
  }
  return <FacultyDashboard />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public / Unauthenticated routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/setup-admin" element={<AdminSetup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authenticated Dashboard routes wrapped in DashboardLayout */}
          <Route element={<DashboardLayout />}>
            {/* Admin only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enrollments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <EnrollmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Smart Faculty route: Faculty Dashboard for faculty, Faculty directory for admin */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}>
                  <FacultySmartRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty-members"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <FacultyPage />
                </ProtectedRoute>
              }
            />

            {/* Student only */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared module routes */}
            <Route
              path="/courses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/examinations"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                  <ExaminationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                  <AssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notices"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                  <NoticesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/placements"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                  <PlacementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
