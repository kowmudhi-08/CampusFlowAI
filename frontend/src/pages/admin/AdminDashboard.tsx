import React, { useEffect, useState } from 'react';
import { analyticsApi, noticeApi } from '../../api/endpoints';
import { DashboardMetrics, Notice } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  Award,
  Briefcase,
  Bell,
  PlusCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, noticesRes] = await Promise.all([
          analyticsApi.getMetrics(),
          noticeApi.getAll(),
        ]);
        setMetrics(metricsRes.data);
        setNotices(noticesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Querying real-time institutional records..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Administration"
        description="Live academic metrics queried directly from the MySQL database"
        action={
          <div className="flex gap-2">
            <Link
              to="/students"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Manage Students
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Add Course
            </Link>
          </div>
        }
      />

      {/* Database Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={metrics?.totalStudents ?? 0}
          subtitle="Enrolled student profiles"
          icon={GraduationCap}
          color="primary"
        />
        <StatCard
          title="Faculty Members"
          value={metrics?.totalFaculty ?? 0}
          subtitle="Active academic staff"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Departments"
          value={metrics?.totalDepartments ?? 0}
          subtitle="Academic divisions"
          icon={Building2}
          color="indigo"
        />
        <StatCard
          title="Courses Offered"
          value={metrics?.totalCourses ?? 0}
          subtitle="Curriculum subjects"
          icon={BookOpen}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrollments"
          value={metrics?.totalEnrollments ?? 0}
          subtitle="Active course seats"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Attendance Sessions"
          value={metrics?.totalAttendanceRecords ?? 0}
          subtitle="Logged records"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Placement Drives"
          value={metrics?.activePlacementDrives ?? 0}
          subtitle="Open recruitment drives"
          icon={Briefcase}
          color="indigo"
        />
        <StatCard
          title="Published Notices"
          value={metrics?.activeNotices ?? 0}
          subtitle="Active announcements"
          icon={Bell}
          color="rose"
        />
      </div>

      {/* Honest Empty State Notice if new installation */}
      {metrics && metrics.totalStudents === 0 && metrics.totalCourses === 0 && (
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl text-primary-900 text-sm">
          <p className="font-semibold mb-1">Clean Database State Initialized</p>
          <p className="text-xs text-primary-800">
            Per the zero-seed-data architecture requirement, no synthetic dummy records have been created. Begin by creating departments, courses, faculty, and student records.
          </p>
        </div>
      )}

      {/* Recent Notices Feed */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-700" />
            Institutional Announcements
          </h2>
          <Link to="/notices" className="text-xs font-semibold text-primary-700 hover:underline">
            View All &rarr;
          </Link>
        </div>

        {notices.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No Notices Published"
            description="There are currently no institutional announcements posted."
            actionLabel="Create First Notice"
            onAction={() => window.location.href = '/notices'}
          />
        ) : (
          <div className="space-y-3">
            {notices.slice(0, 5).map((notice) => (
              <div
                key={notice.id}
                className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">{notice.title}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                    {notice.audience}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notice.content}</p>
                <div className="mt-2 text-[11px] text-slate-400">
                  By {notice.createdByName} • {new Date(notice.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
