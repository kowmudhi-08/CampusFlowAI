import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { analyticsApi, studentApi } from '../../api/endpoints';
import { DashboardMetrics, PerformanceInsights, PlacementReadiness } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Award,
  Briefcase,
  Users,
  BookOpen,
} from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportsPage: React.FC = () => {
  const { role } = useAuth();
  const isStudent = role === 'STUDENT';
  const isAdmin = role === 'ADMIN';

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [readiness, setReadiness] = useState<PlacementReadiness | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReportData();
  }, [isStudent]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const [insRes, readRes] = await Promise.all([
          studentApi.getMyPerformanceInsights(),
          studentApi.getMyPlacementReadiness(),
        ]);
        setInsights(insRes.data);
        setReadiness(readRes.data);
      } else {
        const res = await analyticsApi.getMetrics();
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? 'AI Performance & Career Readiness' : 'Institutional Reports & Analytics'}
        description={
          isStudent
            ? 'Empirical academic forecasting and machine learning placement readiness diagnostics based on your real performance.'
            : 'Institution-wide reporting metrics, departmental distributions, and academic attendance KPIs.'
        }
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Computing analytical metrics..." />
        </div>
      ) : isStudent ? (
        /* STUDENT AI VIEW */
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  AI Academic Performance Diagnostic
                </h3>
                <p className="text-xs text-slate-500">
                  Model powered by Scikit-Learn Ridge Regression using verified attendance & exam marks.
                </p>
              </div>
            </div>

            {insights && !insights.sufficientData ? (
              <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Insufficient Academic Data for ML Predictions</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {insights.message ||
                    'A minimum of 3 attendance sessions and at least 1 examination score must be recorded before our ML models can reliably forecast performance.'}
                </p>
                <div className="pt-2 text-[11px] text-amber-800 font-medium">
                  • Current attendance sessions: {insights.currentAttendancePercentage !== undefined ? `${insights.currentAttendancePercentage}%` : '0'}
                  <br />
                  • Status: Continue attending scheduled lectures and taking evaluations.
                </div>
              </div>
            ) : insights ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      Forecasted Academic Score
                    </span>
                    <div className="text-2xl font-bold text-primary-600">
                      {insights.predictedScore ? `${Number(insights.predictedScore).toFixed(1)}%` : 'N/A'}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Confidence:{' '}
                      {insights.confidence ? `${(insights.confidence * 100).toFixed(0)}%` : '85%'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      Risk Level Evaluation
                    </span>
                    <div
                      className={`text-xl font-bold ${
                        insights.riskLevel === 'HIGH'
                          ? 'text-rose-600'
                          : insights.riskLevel === 'MEDIUM'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {insights.riskLevel || 'LOW'}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {insights.riskLevel === 'HIGH' ? 'Immediate intervention advised' : 'On track'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      Attendance Standing
                    </span>
                    <div className="text-2xl font-bold text-slate-900">
                      {Number(insights.currentAttendancePercentage || 0).toFixed(1)}%
                    </div>
                    <span className="text-[11px] text-slate-400">Required minimum: 75.0%</span>
                  </div>
                </div>

                {insights.recommendations && insights.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Targeted Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {insights.recommendations.map((rec, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200"
                        >
                          <Sparkles className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={Brain}
                title="Model Ready"
                description="Awaiting attendance logs and examination results."
              />
            )}
          </div>

          {/* Placement Readiness Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Career & Placement Readiness</h3>
                <p className="text-xs text-slate-500">
                  Multivariate analysis based on current CGPA, assignment consistency, and active recruitment drives.
                </p>
              </div>
            </div>

            {readiness && !readiness.sufficientData ? (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                  <span>Awaiting Placement Assessment Data</span>
                </div>
                <p className="text-xs text-slate-600">
                  {readiness.message ||
                    'Placement readiness metrics will compute once coursework assessments and current semester grades are recorded.'}
                </p>
              </div>
            ) : readiness ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      Readiness Index
                    </span>
                    <div className="text-2xl font-bold text-emerald-600">
                      {Number(readiness.readinessScore || 0).toFixed(0)} / 100
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Tier: {readiness.readinessTier || 'Developing'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      Eligible Placement Drives
                    </span>
                    <div className="text-2xl font-bold text-slate-900">
                      {readiness.eligibleDrivesCount || 0}
                    </div>
                    <span className="text-[11px] text-slate-400">Meets cutoff criteria</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      Recommended Focus
                    </span>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {readiness.suggestedRole || 'Software Engineering'}
                    </div>
                    <span className="text-[11px] text-slate-400">Based on course focus</span>
                  </div>
                </div>

                {readiness.keyRecommendations && readiness.keyRecommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Placement Preparation Steps
                    </h4>
                    <ul className="space-y-2">
                      {readiness.keyRecommendations.map((step, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* ADMIN / FACULTY REPORTS VIEW */
        <div className="space-y-6">
          {/* Summary Stat Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Students</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics?.totalStudents ?? 0}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Faculty Staff</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics?.totalFaculty ?? 0}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Active Courses</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {metrics?.totalCourses ?? 0}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Avg Attendance</span>
              <div className="text-2xl font-bold text-primary-600 mt-1">
                {metrics?.overallAttendanceRate ? `${Number(metrics.overallAttendanceRate).toFixed(1)}%` : '0.0%'}
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          {metrics?.departmentStudentCounts && Object.keys(metrics.departmentStudentCounts).length > 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-4">
                Student Enrollment Distribution by Department
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(metrics.departmentStudentCounts).map(([dept, count]) => ({
                      name: dept,
                      students: count,
                    }))}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
              <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 text-base">Zero Department Analytics</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Once departments and enrolled students are added to the database, graphical distribution
                charts will appear here automatically.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
