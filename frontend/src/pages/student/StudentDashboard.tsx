import React, { useEffect, useState } from 'react';
import { studentApi } from '../../api/endpoints';
import {
  Enrollment,
  AttendanceSummary,
  Mark,
  Submission,
  PerformanceInsights,
  PlacementReadiness,
} from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  BookOpen,
  CalendarCheck,
  Award,
  AlertTriangle,
  Sparkles,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [readiness, setReadiness] = useState<PlacementReadiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, attRes, marksRes, subRes, insRes, readRes] = await Promise.all([
          studentApi.getMyCourses(),
          studentApi.getMyAttendance(),
          studentApi.getMyMarks(),
          studentApi.getMySubmissions(),
          studentApi.getMyPerformanceInsights(),
          studentApi.getMyPlacementReadiness(),
        ]);
        setCourses(coursesRes.data);
        setAttendance(attRes.data);
        setMarks(marksRes.data);
        setSubmissions(subRes.data);
        setInsights(insRes.data);
        setReadiness(readRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your student records and academic analytics..." size="lg" />;
  }

  // Calculate overall attendance %
  const totalSessions = attendance.reduce((acc, a) => acc + a.totalSessions, 0);
  const totalAttended = attendance.reduce((acc, a) => acc + (a.presentCount + a.lateCount * 0.5), 0);
  const overallAttendance = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0;
  const hasLowAttendance = attendance.some((a) => a.lowAttendanceWarning);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Academic Workspace"
        description="Personal academic records, attendance discipline, marks, and placement readiness"
      />

      {/* Low Attendance Warning Alert */}
      {hasLowAttendance && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-sm shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Low Attendance Notice: </span>
            Your attendance in one or more courses is below the institutional benchmark of 75%. Please attend upcoming lectures to maintain examination clearance.
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={courses.length}
          subtitle="Active subjects this term"
          icon={BookOpen}
          color="primary"
        />
        <StatCard
          title="Attendance Rate"
          value={totalSessions > 0 ? `${overallAttendance}%` : 'N/A'}
          subtitle={totalSessions > 0 ? `${totalSessions} sessions logged` : 'No sessions recorded yet'}
          icon={CalendarCheck}
          color={overallAttendance >= 75 || totalSessions === 0 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Cumulative CGPA"
          value={readiness?.currentCgpa ? `${readiness.currentCgpa}/10` : '0.00'}
          subtitle="Verified academic standing"
          icon={Award}
          color="indigo"
        />
        <StatCard
          title="Assignments Submitted"
          value={submissions.length}
          subtitle="Coursework records"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* AI Performance Insights & Placement Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Insights Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-700" />
              Academic Performance Insights
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 font-bold rounded-full ${
                insights?.riskStatus === 'LOW_RISK'
                  ? 'bg-emerald-100 text-emerald-800'
                  : insights?.riskStatus === 'MODERATE_RISK'
                  ? 'bg-amber-100 text-amber-800'
                  : insights?.riskStatus === 'AT_RISK'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {insights?.riskStatus || 'INSUFFICIENT_DATA'}
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-4">{insights?.statusMessage}</p>

          {insights?.dataSufficient ? (
            <div className="space-y-3 text-xs">
              {insights.predictedScoreRange && (
                <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <span className="font-bold text-primary-900">Projected Assessment Range: </span>
                  <span className="font-semibold text-primary-800">{insights.predictedScoreRange}</span>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Key Strengths</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {insights.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Recommendations</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {insights.recommendations.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">Notice: Insufficient Academic Data</p>
              <p>
                In compliance with honest AI engineering practices, predictive analytics are paused until at least 3 attendance events and examination marks are recorded.
              </p>
            </div>
          )}
        </div>

        {/* Placement Readiness Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary-700" />
              Placement Readiness Assessment
            </h2>
            <span className="text-xs px-2.5 py-0.5 font-bold rounded-full bg-primary-100 text-primary-800">
              {readiness?.readinessLevel || 'NOT_READY'}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
              <span>Readiness Index</span>
              <span>{readiness?.readinessScore ?? 0} / 100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary-700 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${readiness?.readinessScore ?? 0}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-4">{readiness?.explanation}</p>

          <div className="space-y-3 text-xs">
            {readiness?.positiveFactors && readiness.positiveFactors.length > 0 && (
              <div>
                <h4 className="font-bold text-emerald-800 mb-1">Positive Criteria</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {readiness.positiveFactors.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {readiness?.recommendedActions && readiness.recommendedActions.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Recommended Actions</h4>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {readiness.recommendedActions.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-700" />
          My Enrolled Courses
        </h2>

        {courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Courses Enrolled"
            description="You are currently not enrolled in any courses for this term."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((enrollment) => (
              <div
                key={enrollment.id}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                    {enrollment.courseCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{enrollment.courseCredits} Credits</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{enrollment.courseTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">Instructor: {enrollment.facultyName || 'TBA'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
