import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { enrollmentApi, courseApi, studentApi, academicSessionApi } from '../../api/endpoints';
import { Enrollment, Course, Student, AcademicSession } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Trash2, UserCheck, Filter, X } from 'lucide-react';

export const EnrollmentsPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [studentId, setStudentId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchDependencies = async () => {
    try {
      const [cRes, sRes, sessRes] = await Promise.all([
        courseApi.getAll(),
        studentApi.getAll(),
        academicSessionApi.getAll(),
      ]);
      setCourses(cRes.data);
      setStudents(sRes.data);
      setSessions(sessRes.data);
    } catch (err) {
      console.error('Failed to load dependencies', err);
    }
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      if (selectedCourseId) {
        const res = await enrollmentApi.getByCourse(parseInt(selectedCourseId, 10));
        setEnrollments(res.data);
      } else {
        const res = await enrollmentApi.getAll();
        setEnrollments(res.data);
      }
    } catch (err) {
      console.error('Failed to load enrollments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [selectedCourseId]);

  const openEnrollModal = () => {
    setStudentId(students.length > 0 ? students[0].id.toString() : '');
    setCourseId(courses.length > 0 ? courses[0].id.toString() : '');
    const currentSession = sessions.find((s) => s.current);
    setSessionId(currentSession ? currentSession.id.toString() : (sessions[0]?.id?.toString() || ''));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !courseId) {
      setErrorMsg('Please select both a student and a course.');
      return;
    }

    setModalLoading(true);
    setErrorMsg('');

    try {
      await enrollmentApi.enroll({
        studentId: parseInt(studentId, 10),
        courseId: parseInt(courseId, 10),
        academicSessionId: sessionId ? parseInt(sessionId, 10) : undefined,
      });
      setIsModalOpen(false);
      fetchEnrollments();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to enroll student.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUnenroll = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this course enrollment?')) return;
    try {
      await enrollmentApi.unenroll(id);
      fetchEnrollments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove enrollment.');
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      e.studentRollNumber?.toLowerCase().includes(query) ||
      e.studentName?.toLowerCase().includes(query) ||
      e.courseCode?.toLowerCase().includes(query) ||
      e.courseTitle?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Enrollments"
        description="Register students into course modules, monitor class rosters, and manage semester credits."
        actions={
          isAdmin ? (
            <button
              onClick={openEnrollModal}
              disabled={students.length === 0 || courses.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Enroll Student
            </button>
          ) : undefined
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student, roll number, or course code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Course:</span>
          </div>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white min-w-[200px]"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading enrollment records..." />
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Enrollments Found"
          description={
            search || selectedCourseId
              ? 'No enrollments match the current search or course filter.'
              : 'No students are currently enrolled into any courses in the system.'
          }
          actionLabel={isAdmin && students.length > 0 && courses.length > 0 ? 'Enroll Student' : undefined}
          onAction={isAdmin ? openEnrollModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Roll Number</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Course</th>
                  <th className="px-6 py-3.5">Academic Session</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Enrolled Date</th>
                  {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEnrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {enr.studentRollNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{enr.studentName}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-mono font-bold text-slate-800 mr-2">{enr.courseCode}</span>
                        <span className="text-slate-600">{enr.courseTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {enr.academicSessionName || 'Current Term'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {enr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString() : '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUnenroll(enr.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Enrollment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            Showing {filteredEnrollments.length} enrolled student record{filteredEnrollments.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Enroll Student into Course</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Student *
                </label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Course *
                </label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Session
                </label>
                <select
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Default / Current</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.current ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {modalLoading ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
