import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { departmentApi, academicSessionApi } from '../../api/endpoints';
import { Department, AcademicSession } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Building2, Calendar, X } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'departments' | 'sessions'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Department Modal
  const [deptModalOpen, setDeptModalOpen] = useState<boolean>(false);
  const [deptEditing, setDeptEditing] = useState<boolean>(false);
  const [deptId, setDeptId] = useState<number | null>(null);
  const [deptName, setDeptName] = useState<string>('');
  const [deptCode, setDeptCode] = useState<string>('');
  const [deptDescription, setDeptDescription] = useState<string>('');

  // Session Modal
  const [sessionModalOpen, setSessionModalOpen] = useState<boolean>(false);
  const [sessionEditing, setSessionEditing] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionName, setSessionName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isCurrent, setIsCurrent] = useState<boolean>(true);

  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, sessRes] = await Promise.all([
        departmentApi.getAll(),
        academicSessionApi.getAll(),
      ]);
      setDepartments(deptRes.data);
      setSessions(sessRes.data);
    } catch (err) {
      console.error('Failed to load department or session data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Department Handlers
  const openCreateDept = () => {
    setDeptEditing(false);
    setDeptId(null);
    setDeptName('');
    setDeptCode('');
    setDeptDescription('');
    setErrorMsg('');
    setDeptModalOpen(true);
  };

  const openEditDept = (d: Department) => {
    setDeptEditing(true);
    setDeptId(d.id);
    setDeptName(d.name);
    setDeptCode(d.code);
    setDeptDescription(d.description || '');
    setErrorMsg('');
    setDeptModalOpen(true);
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg('');
    try {
      if (deptEditing && deptId) {
        await departmentApi.update(deptId, {
          name: deptName,
          code: deptCode,
          description: deptDescription,
        });
      } else {
        await departmentApi.create({
          name: deptName,
          code: deptCode,
          description: deptDescription,
        });
      }
      setDeptModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteDept = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentApi.delete(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  // Session Handlers
  const openCreateSession = () => {
    setSessionEditing(false);
    setSessionId(null);
    setSessionName('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(true);
    setErrorMsg('');
    setSessionModalOpen(true);
  };

  const openEditSession = (s: AcademicSession) => {
    setSessionEditing(true);
    setSessionId(s.id);
    setSessionName(s.name);
    setStartDate(s.startDate);
    setEndDate(s.endDate);
    setIsCurrent(s.current);
    setErrorMsg('');
    setSessionModalOpen(true);
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg('');
    try {
      if (sessionEditing && sessionId) {
        await academicSessionApi.update(sessionId, {
          name: sessionName,
          startDate,
          endDate,
          current: isCurrent,
        });
      } else {
        await academicSessionApi.create({
          name: sessionName,
          startDate,
          endDate,
          current: isCurrent,
        });
      }
      setSessionModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save academic session.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this academic session?')) return;
    try {
      await academicSessionApi.delete(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete session.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments & Academic Sessions"
        description="Configure academic divisions, degree majors, faculties, and institutional academic calendars."
        actions={
          isAdmin ? (
            <button
              onClick={activeTab === 'departments' ? openCreateDept : openCreateSession}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'departments' ? 'Add Department' : 'Add Academic Session'}
            </button>
          ) : undefined
        }
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'departments'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'sessions'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Academic Sessions ({sessions.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading department configurations..." />
        </div>
      ) : activeTab === 'departments' ? (
        departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Departments Configured"
            description="Create your first college department (e.g. Computer Science, Mechanical Engineering)."
            actionLabel={isAdmin ? 'Create Department' : undefined}
            onAction={isAdmin ? openCreateDept : undefined}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Department Name</th>
                  <th className="px-6 py-3.5">Description</th>
                  {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{dept.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{dept.name}</td>
                    <td className="px-6 py-4 text-slate-600">{dept.description || '—'}</td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditDept(dept)}
                            className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDept(dept.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Academic Sessions Configured"
          description="Create your first academic term or semester (e.g., 2026-2027 Academic Year)."
          actionLabel={isAdmin ? 'Create Academic Session' : undefined}
          onAction={isAdmin ? openCreateSession : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3.5">Session Name</th>
                <th className="px-6 py-3.5">Start Date</th>
                <th className="px-6 py-3.5">End Date</th>
                <th className="px-6 py-3.5">Current Term</th>
                {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{sess.name}</td>
                  <td className="px-6 py-4 text-slate-600">{sess.startDate}</td>
                  <td className="px-6 py-4 text-slate-600">{sess.endDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sess.current
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {sess.current ? 'Active Session' : 'Past'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditSession(sess)}
                          className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(sess.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Department Modal */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {deptEditing ? 'Edit Department' : 'Create Department'}
              </h3>
              <button onClick={() => setDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleDeptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="e.g. CSE, ECE, MECH"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  placeholder="Department details, specializations, etc."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : deptEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Session Modal */}
      {sessionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {sessionEditing ? 'Edit Academic Session' : 'Create Academic Session'}
              </h3>
              <button onClick={() => setSessionModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSessionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Session Name *</label>
                <input
                  type="text"
                  required
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. 2026-2027 Fall Semester"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sessionCurrent"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <label htmlFor="sessionCurrent" className="text-xs font-semibold text-slate-700">
                  Set as Current Active Session
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSessionModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : sessionEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
