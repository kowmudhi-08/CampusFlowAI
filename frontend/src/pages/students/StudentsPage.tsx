import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { studentApi, departmentApi } from '../../api/endpoints';
import { Student, Department } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Edit2, Trash2, GraduationCap, X, Check, Filter } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [students, setStudents] = useState<Student[]>([]);
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
  const [rollNumber, setRollNumber] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [batchYear, setBatchYear] = useState<number>(new Date().getFullYear());
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [cgpa, setCgpa] = useState<number>(0.0);
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

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const deptId = selectedDept ? parseInt(selectedDept, 10) : undefined;
      const res = await studentApi.getAll(deptId, search || undefined);
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedDept]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setRollNumber('');
    setDepartmentId(departments.length > 0 ? departments[0].id.toString() : '');
    setBatchYear(new Date().getFullYear());
    setPhone('');
    setAddress('');
    setCgpa(0.0);
    setActive(true);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setIsEditing(true);
    setCurrentId(s.id);
    setFullName(s.fullName);
    setEmail(s.email);
    setPassword('');
    setRollNumber(s.rollNumber);
    setDepartmentId(s.departmentId ? s.departmentId.toString() : '');
    setBatchYear(s.batchYear || new Date().getFullYear());
    setPhone(s.phone || '');
    setAddress(s.address || '');
    setCgpa(s.cgpa || 0.0);
    setActive(s.active);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setModalLoading(true);

    try {
      if (isEditing && currentId) {
        await studentApi.update(currentId, {
          rollNumber,
          departmentId: departmentId ? parseInt(departmentId, 10) : null,
          batchYear: Number(batchYear),
          phone,
          address,
          cgpa: Number(cgpa),
          active,
        });
      } else {
        await studentApi.create({
          fullName,
          email,
          password,
          rollNumber,
          departmentId: departmentId ? parseInt(departmentId, 10) : null,
          batchYear: Number(batchYear),
          phone,
          address,
          cgpa: Number(cgpa),
        });
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0] || 'Operation failed. Please check inputs.';
      setErrorMsg(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await studentApi.delete(id);
      setDeleteConfirmId(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        description="View, register, and manage enrolled student profiles, academic batches, and credentials."
        actions={
          isAdmin ? (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          ) : undefined
        }
      />

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white min-w-[180px]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
          <button
            onClick={fetchStudents}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading student records..." />
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No Students Found"
          description={
            search || selectedDept
              ? 'No student records match the specified filters.'
              : 'There are currently no students registered in the college system.'
          }
          actionLabel={isAdmin ? 'Add First Student' : undefined}
          onAction={isAdmin ? openCreateModal : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Roll Number</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Batch</th>
                  <th className="px-6 py-3.5">CGPA</th>
                  <th className="px-6 py-3.5">Status</th>
                  {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{student.fullName}</div>
                      {student.phone && <div className="text-xs text-slate-400">{student.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {student.departmentName || 'Not Assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.batchYear || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {Number(student.cgpa).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(student.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Student"
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
            Showing {students.length} student record{students.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Student Profile' : 'Register New Student'}
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="jane.doe@campusflow.edu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Initial Password *
                    </label>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="CS2026-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Batch Year *
                  </label>
                  <input
                    type="number"
                    required
                    min={2000}
                    max={2040}
                    value={batchYear}
                    onChange={(e) => setBatchYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.0}
                    max={10.0}
                    value={cgpa}
                    onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="+1 555-0199"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="123 Campus Way"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="studentActive"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                  <label htmlFor="studentActive" className="text-xs font-semibold text-slate-700">
                    Active Student Account
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
                  {modalLoading ? 'Saving...' : isEditing ? 'Update Student' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Student?</h3>
            <p className="text-sm text-slate-600 mb-6">
              This action will deactivate or delete this student record from the college directory.
              This cannot be undone if enrollments or grades are linked.
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
