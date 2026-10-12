import React, { useEffect, useState } from 'react';
import { facultyApi, noticeApi } from '../../api/endpoints';
import { Course, Notice } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { BookOpen, Users, CalendarCheck, Award, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, noticesRes] = await Promise.all([
          facultyApi.getMyCourses(),
          noticeApi.getFeed(),
        ]);
        setCourses(coursesRes.data);
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
    return <LoadingSpinner message="Loading faculty teaching modules..." size="lg" />;
  }

  const totalEnrolled = courses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Academic Portal"
        description="Manage assigned courses, record class attendance, and grade student submissions"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Courses"
          value={courses.length}
          subtitle="Current teaching modules"
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Total Students"
          value={totalEnrolled}
          subtitle="Enrolled across your classes"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Active Notices"
          value={notices.length}
          subtitle="Faculty announcements"
          icon={Bell}
          color="indigo"
        />
      </div>

      {/* Courses List */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-700" />
            My Teaching Courses
          </h2>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Courses Assigned Yet"
            description="The administration has not yet assigned any courses to your faculty account."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-5 border border-slate-200 rounded-xl bg-white hover:border-slate-300 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Sem {course.semester} • {course.credits} Credits
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description || 'No description provided'}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.enrolledStudentsCount} enrolled</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to="/attendance"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Mark Attendance"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Attendance
                    </Link>
                    <Link
                      to="/examinations"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                      title="Manage Marks"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Marks
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notices */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-700" />
          Campus Announcements
        </h2>
        {notices.length === 0 ? (
          <p className="text-sm text-slate-500">No announcements available at this time.</p>
        ) : (
          <div className="space-y-3">
            {notices.slice(0, 3).map((notice) => (
              <div key={notice.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-slate-900">{notice.title}</h4>
                  <span className="text-[11px] text-slate-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{notice.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
