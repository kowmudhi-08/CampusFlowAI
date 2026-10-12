import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { facultyApi, departmentApi } from '../../api/endpoints';
import { Faculty, Department } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Edit2, Trash2, Users, X, Filter } from 'lucide-react';

export const FacultyPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [designation, setDesignation] = useState<string>('Assistant Professor');
  const [qualification, setQualification] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);

  // Delete confirmation modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const deptId = selectedDept ? parseInt(selectedDept, 10) : undefined;
      const res = await facultyApi.getAll(deptId, search || undefined);
      setFacultyList(res.data);
    } catch (err) {
      console.error('Failed to load faculty', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [selectedDept]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFaculty();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setEmployeeCode('');
    setDepartmentId(departments.length > 0 ? departments[0].id.toString() : '');
    setDesignation('Assistant Professor');
    setQualification('');
    setPhone('');
    setActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (f: Faculty) => {
    setIsEditing(true);
    setCurrentId(f.id);
    setFullName(f.fullName);
    setEmail(f.email);
    setPassword('');
    setEmployeeCode(f.employeeCode);
    setDepartmentId(f.departmentId ? f.departmentId.toString() : '');
    setDesignation(f.designation || 'Assistant Professor');
    setQualification(f.qualification || '');
    setPhone(f.phone || '');
    setActive(f.active);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setModalLoading(true);

    try {
      if (isEditing && currentId) {
        await facultyApi.update(currentId, {
          employeeCode,
          departmentId: departmentId ? parseInt(departmentId, 10) : null,
          designation,
          qualification,
          phone,
          active,
        });
      } else {
        await facultyApi.create({
          fullName,
          email,
          password,
          employeeCode,
          departmentId: departmentId ? parseInt(departmentId, 10) : null,
          designation,
          qualification,
          phone,
        });
      }
      setIsModalOpen(false);
      fetchFaculty();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Operation failed. Please check inputs.';
      setErrorMsg(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await facultyApi.delete(id);
      setDeleteConfirmId(null);
      fetchFaculty();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete faculty record.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Management"
        description="View, appoint, and organize academic professors, lecturers, and department heads."
        actions={
          isAdmin ? (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Faculty
            </button>
          ) : undefined
        }
      />

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by faculty name, code, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Department:</span>
          </div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white min-w-[180px]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
          <button
            onClick={fetchFaculty}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading faculty members..." />
        </div>
      ) : facultyList.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Faculty Members"
          description={
            search || selectedDept
              ? 'No faculty members match the specified filters.'
              : 'There are currently no faculty members registered in the college system.'
          }
          actionLabel={isAdmin ? 'Add First Faculty' : undefined}
          onAction={isAdmin ? openCreateModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Employee Code</th>
                  <th className="px-6 py-3.5">Faculty Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Designation</th>
                  <th className="px-6 py-3.5">Qualification</th>
                  <th className="px-6 py-3.5">Status</th>
                  {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {facultyList.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {faculty.employeeCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{faculty.fullName}</div>
                      {faculty.phone && <div className="text-xs text-slate-400">{faculty.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{faculty.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {faculty.departmentName || 'Not Assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {faculty.designation || 'Lecturer'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{faculty.qualification || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          faculty.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {faculty.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(faculty)}
                            className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="Edit Faculty"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(faculty.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Faculty"
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
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            Showing {facultyList.length} faculty member{facultyList.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Faculty Record' : 'Add Faculty Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {!isEditing && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Dr. Alan Turing"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="alan.turing@campusflow.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="FAC-CS-101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">None / Unassigned</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Professor / HOD"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Ph.D. in Computer Science"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="+1 555-0155"
                />
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="facActive"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                  <label htmlFor="facActive" className="text-xs font-semibold text-slate-700">
                    Active Faculty Member
                  </label>
                </div>
              )}

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
                  {modalLoading ? 'Saving...' : isEditing ? 'Update Faculty' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Faculty?</h3>
            <p className="text-sm text-slate-600 mb-6">
              This action will remove the faculty record from the directory. Active course assignments
              must be reassigned.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
