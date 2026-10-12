import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { attendanceApi, courseApi, enrollmentApi, studentApi } from '../../api/endpoints';
import { AttendanceRecord, AttendanceSummary, Course, Enrollment, AttendanceStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CalendarCheck, AlertTriangle, CheckCircle2, Clock, XCircle, Users, Check } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { role } = useAuth();
  const isStudent = role === 'STUDENT';

  // Student State
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  // Faculty/Admin State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sessionName, setSessionName] = useState<string>('Lecture 1');
  const [studentStatusMap, setStudentStatusMap] = useState<Record<number, AttendanceStatus>>({});
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Initial load
  useEffect(() => {
    if (isStudent) {
      loadStudentAttendance();
    } else {
      loadFacultyCourses();
    }
  }, [isStudent]);

  const loadStudentAttendance = async () => {
    setLoading(true);
    try {
      const [sumRes, histRes] = await Promise.all([
        studentApi.getMyAttendance(),
        studentApi.getMyAttendanceHistory(),
      ]);
      setSummaries(sumRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error('Error fetching student attendance', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFacultyCourses = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getAll();
      setCourses(res.data);
      if (res.data.length > 0) {
        setSelectedCourseId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error loading courses for attendance', err);
    } finally {
      setLoading(false);
    }
  };

  // When selectedCourseId changes, fetch enrolled students & recent attendance
  useEffect(() => {
    if (!isStudent && selectedCourseId) {
      loadCourseEnrollmentsAndRecords(parseInt(selectedCourseId, 10));
    }
  }, [selectedCourseId, isStudent]);

  const loadCourseEnrollmentsAndRecords = async (courseId: number) => {
    try {
      const [enrRes, attRes] = await Promise.all([
        enrollmentApi.getByCourse(courseId),
        attendanceApi.getByCourse(courseId),
      ]);
      setEnrolledStudents(enrRes.data);
      setRecentRecords(attRes.data);

      // Default all enrolled students to PRESENT
      const initialMap: Record<number, AttendanceStatus> = {};
      enrRes.data.forEach((e) => {
        initialMap[e.studentId] = 'PRESENT';
      });
      setStudentStatusMap(initialMap);
    } catch (err) {
      console.error('Failed to load course student list', err);
    }
  };

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    setStudentStatusMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<number, AttendanceStatus> = {};
    enrolledStudents.forEach((e) => {
      updated[e.studentId] = status;
    });
    setStudentStatusMap(updated);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || enrolledStudents.length === 0) return;

    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const records = enrolledStudents.map((e) => ({
        studentId: e.studentId,
        status: studentStatusMap[e.studentId] || 'PRESENT',
      }));

      await attendanceApi.mark({
        courseId: parseInt(selectedCourseId, 10),
        attendanceDate,
        sessionName,
        records,
      });

      setSuccessMsg(`Attendance successfully recorded for ${records.length} students!`);
      // Refresh recent records
      const attRes = await attendanceApi.getByCourse(parseInt(selectedCourseId, 10));
      setRecentRecords(attRes.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? 'My Attendance Record' : 'Attendance Tracking & Roster'}
        description={
          isStudent
            ? 'Track your real-time attendance percentage per course and view session timestamps.'
            : 'Take daily roll-call for course sections, record present/absent logs, and verify compliance.'
        }
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading attendance records..." />
        </div>
      ) : isStudent ? (
        /* STUDENT VIEW */
        <div className="space-y-8">
          {summaries.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No Attendance Data Available"
              description="No attendance sessions have been marked for your enrolled courses yet."
            />
          ) : (
            <>
              {/* Course Summaries */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-sm text-slate-800">
                  Course-Wise Attendance Percentage
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                      <tr>
                        <th className="px-6 py-3.5">Course</th>
                        <th className="px-6 py-3.5 text-center">Total Sessions</th>
                        <th className="px-6 py-3.5 text-center">Present</th>
                        <th className="px-6 py-3.5 text-center">Late</th>
                        <th className="px-6 py-3.5 text-center">Absent</th>
                        <th className="px-6 py-3.5 text-right">Attendance %</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {summaries.map((s) => (
                        <tr key={s.courseId} className="hover:bg-slate-50/75">
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-slate-900 mr-2">{s.courseCode}</span>
                            <span className="text-slate-600">{s.courseTitle}</span>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-slate-800">
                            {s.totalSessions}
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-emerald-600">
                            {s.presentCount}
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-amber-600">
                            {s.lateCount}
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-rose-600">
                            {s.absentCount}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">
                            {Number(s.percentage).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 text-center">
                            {s.lowAttendanceWarning ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Below 75%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                In Good Standing
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-sm text-slate-800">
                  Recent Attendance Logs
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase sticky top-0">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Course</th>
                        <th className="px-6 py-3">Session</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td className="px-6 py-3 font-mono text-xs text-slate-700">{h.attendanceDate}</td>
                          <td className="px-6 py-3 font-medium text-slate-900">{h.courseCode}</td>
                          <td className="px-6 py-3 text-slate-600">{h.sessionName}</td>
                          <td className="px-6 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                h.status === 'PRESENT'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : h.status === 'LATE'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* FACULTY / ADMIN VIEW */
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">Select Course & Session Date</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session / Lecture</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. Lecture 12 - Sorting"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          {/* Roster & Marking Table */}
          {enrolledStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Enrolled Students"
              description="No students are currently enrolled in the selected course to mark attendance."
            />
          ) : (
            <form onSubmit={handleSubmitAttendance} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Course Roll-Call Roster</h4>
                  <p className="text-xs text-slate-500">{enrolledStudents.length} Students Enrolled</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkAll('PRESENT')}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll('ABSENT')}
                    className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">Roll Number</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {enrolledStudents.map((enr) => {
                      const cur = studentStatusMap[enr.studentId] || 'PRESENT';
                      return (
                        <tr key={enr.id} className="hover:bg-slate-50/75">
                          <td className="px-6 py-3.5 font-mono font-medium text-slate-900">
                            {enr.studentRollNumber}
                          </td>
                          <td className="px-6 py-3.5 font-medium text-slate-900">{enr.studentName}</td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center justify-center gap-4">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-emerald-700">
                                <input
                                  type="radio"
                                  name={`status-${enr.studentId}`}
                                  checked={cur === 'PRESENT'}
                                  onChange={() => handleStatusChange(enr.studentId, 'PRESENT')}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                />
                                Present
                              </label>

                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-amber-700">
                                <input
                                  type="radio"
                                  name={`status-${enr.studentId}`}
                                  checked={cur === 'LATE'}
                                  onChange={() => handleStatusChange(enr.studentId, 'LATE')}
                                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                                />
                                Late
                              </label>

                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-rose-700">
                                <input
                                  type="radio"
                                  name={`status-${enr.studentId}`}
                                  checked={cur === 'ABSENT'}
                                  onChange={() => handleStatusChange(enr.studentId, 'ABSENT')}
                                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                                />
                                Absent
                              </label>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Save Attendance Session'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
