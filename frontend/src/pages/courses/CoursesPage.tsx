import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { courseApi, departmentApi, facultyApi, academicSessionApi, studentApi } from '../../api/endpoints';
import { Course, Department, Faculty, AcademicSession, Enrollment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Edit2, Trash2, BookOpen, Users, User, X, Filter, Calendar } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';
  const isFaculty = role === 'FACULTY';
  const isStudent = role === 'STUDENT';

  const [courses, setCourses] = useState<Course[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Course Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form Fields
  const [code, setCode] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [credits, setCredits] = useState<number>(3);
  const [semester, setSemester] = useState<number>(1);
  const [deptId, setDeptId] = useState<string>('');
  const [facId, setFacId] = useState<string>('');
  const [sessId, setSessId] = useState<string>('');

  const fetchDependencies = async () => {
    try {
      const [dRes, fRes, sRes] = await Promise.all([
        departmentApi.getAll(),
        facultyApi.getAll(),
        academicSessionApi.getAll(),
      ]);
      setDepartments(dRes.data);
      setFacultyList(fRes.data);
      setSessions(sRes.data);
    } catch (err) {
      console.error('Error fetching dependencies', err);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const res = await studentApi.getMyCourses();
        setStudentEnrollments(res.data);
      } else if (isFaculty) {
        const res = await facultyApi.getMyCourses();
        setCourses(res.data);
      } else {
        const dId = selectedDept ? parseInt(selectedDept, 10) : undefined;
        const res = await courseApi.getAll(dId);
        setCourses(res.data);
      }
    } catch (err) {
      console.error('Error loading courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchDependencies();
    fetchCourses();
  }, [selectedDept]);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setCode('');
    setTitle('');
    setDescription('');
    setCredits(3);
    setSemester(1);
    setDeptId(departments.length > 0 ? departments[0].id.toString() : '');
    setFacId('');
    const currentSession = sessions.find((s) => s.current);
    setSessId(currentSession ? currentSession.id.toString() : (sessions[0]?.id?.toString() || ''));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setIsEditing(true);
    setCurrentId(c.id);
    setCode(c.code);
    setTitle(c.title);
    setDescription(c.description || '');
    setCredits(c.credits);
    setSemester(c.semester);
    setDeptId(c.departmentId ? c.departmentId.toString() : '');
    setFacId(c.facultyId ? c.facultyId.toString() : '');
    setSessId(c.academicSessionId ? c.academicSessionId.toString() : '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        code,
        title,
        description,
        credits: Number(credits),
        semester: Number(semester),
        departmentId: deptId ? parseInt(deptId, 10) : null,
        facultyId: facId ? parseInt(facId, 10) : null,
        academicSessionId: sessId ? parseInt(sessId, 10) : null,
      };

      if (isEditing && currentId) {
        await courseApi.update(currentId, payload);
      } else {
        await courseApi.create(payload);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseApi.delete(id);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      c.code.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      (c.facultyName && c.facultyName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? 'My Enrolled Courses' : isFaculty ? 'My Assigned Courses' : 'Course Catalog & Management'}
        description={
          isStudent
            ? 'View current semester courses, enrolled credit weightage, and course instructors.'
            : isFaculty
            ? 'Manage subjects, syllabus materials, and enrolled students for your assigned courses.'
            : 'Configure accredited courses, syllabus offerings, credit hours, and assign instructors.'
        }
        actions={
          isAdmin ? (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          ) : undefined
        }
      />

      {/* Filter bar for Admin/Faculty */}
      {!isStudent && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course code, title, or instructor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {isAdmin && (
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
            </div>
          )}
        </div>
      )}

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading course curriculum..." />
        </div>
      ) : isStudent ? (
        studentEnrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Course Enrollments"
            description="You are not currently enrolled in any courses for this academic term."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentEnrollments.map((enr) => (
              <div
                key={enr.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-primary-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-primary-50 text-primary-700 rounded-lg">
                      {enr.courseCode}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {enr.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{enr.courseTitle}</h3>
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Instructor: {enr.facultyName || 'TBA'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Session: {enr.academicSessionName || 'Current'}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Credits: {enr.courseCredits}</span>
                  <span>Enrolled: {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString() : 'Active'}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Courses Available"
          description={
            search || selectedDept
              ? 'No courses match the specified search or filter criteria.'
              : isFaculty
              ? 'You have not been assigned to any courses yet.'
              : 'No courses have been created in the academic catalog.'
          }
          actionLabel={isAdmin ? 'Create First Course' : undefined}
          onAction={isAdmin ? openCreateModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-primary-50 text-primary-700 rounded-lg">
                    {c.code}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Semester {c.semester} • {c.credits} Credits
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-2">{c.title}</h3>
                {c.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{c.description}</p>
                )}

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dept: {c.departmentName || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Instructor: {c.facultyName || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Enrolled: {c.enrolledStudentsCount || 0} Students</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit Course"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Course Offering' : 'Add New Course'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="CS-301"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credits *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Data Structures and Algorithms"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Course overview, syllabus objectives..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester *</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">General / None</option>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Instructor
                  </label>
                  <select
                    value={facId}
                    onChange={(e) => setFacId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.fullName} ({f.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Term
                  </label>
                  <select
                    value={sessId}
                    onChange={(e) => setSessId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="">None</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.current ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {modalLoading ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
