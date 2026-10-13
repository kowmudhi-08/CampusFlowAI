import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { examinationApi, courseApi, enrollmentApi, studentApi } from '../../api/endpoints';
import { Examination, Course, Mark, Enrollment, ExamType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Award, CheckCircle, Eye, EyeOff, Edit3, X, Trash2, Check, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ExaminationsPage: React.FC = () => {
  const { role } = useAuth();
  const isStudent = role === 'STUDENT';
  const isAdmin = role === 'ADMIN';

  // Student State
  const [studentMarks, setStudentMarks] = useState<Mark[]>([]);

  // Faculty / Admin State
  const [exams, setExams] = useState<Examination[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successBanner, setSuccessBanner] = useState<string>('');

  // Create Exam Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [examTitle, setExamTitle] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(180);
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [examType, setExamType] = useState<ExamType>('MIDTERM');
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Enter Marks Modal
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  const [marksMap, setMarksMap] = useState<Record<number, { marksObtained: number; remarks: string }>>({});
  const [marksModalOpen, setMarksModalOpen] = useState<boolean>(false);
  const [marksLoading, setMarksLoading] = useState<boolean>(false);
  const [marksSubmitting, setMarksSubmitting] = useState<boolean>(false);
  const [marksError, setMarksError] = useState<string>('');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const res = await studentApi.getMyMarks();
        setStudentMarks(res.data);
      } else {
        const [eRes, cRes] = await Promise.all([
          examinationApi.getAll(),
          courseApi.getAll(),
        ]);
        setExams(eRes.data);
        setCourses(cRes.data);
      }
    } catch (err) {
      console.error('Error fetching examination data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [isStudent]);

  // Open Create Exam modal and refresh available courses
  const openCreateModal = async () => {
    setExamTitle('');
    setExamDate(new Date().toISOString().split('T')[0]);
    setStartTime('10:00');
    setDurationMinutes(180);
    setMaxMarks(100);
    setExamType('MIDTERM');
    setModalError('');
    setFieldErrors({});
    setIsCreateModalOpen(true);

    try {
      const cRes = await courseApi.getAll();
      setCourses(cRes.data);
      if (cRes.data.length > 0) {
        setCourseId(cRes.data[0].id.toString());
      } else {
        setCourseId('');
      }
    } catch (err) {
      console.error('Failed to load courses for scheduling', err);
    }
  };

  const validateExamForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!examTitle.trim() || examTitle.trim().length < 2) {
      errs.title = 'Exam title is required (minimum 2 characters).';
    }
    if (!courseId) {
      errs.courseId = 'Please select a valid course.';
    }
    if (!examDate) {
      errs.examDate = 'Exam date is required.';
    }
    if (!maxMarks || maxMarks <= 0) {
      errs.maxMarks = 'Max marks must be greater than 0.';
    }
    if (!durationMinutes || durationMinutes <= 0) {
      errs.durationMinutes = 'Duration must be at least 1 minute.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!validateExamForm()) {
      return;
    }

    setModalLoading(true);
    try {
      await examinationApi.create({
        title: examTitle.trim(),
        courseId: parseInt(courseId, 10),
        examDate,
        startTime,
        durationMinutes: Number(durationMinutes),
        maxMarks: Number(maxMarks),
        examType,
      });

      setSuccessBanner(`Examination "${examTitle.trim()}" successfully scheduled!`);
      setIsCreateModalOpen(false);
      fetchInitialData();
      setTimeout(() => setSuccessBanner(''), 6000);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to schedule exam.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleTogglePublish = async (exam: Examination) => {
    try {
      await examinationApi.publish(exam.id, !exam.published);
      setSuccessBanner(
        `Examination "${exam.title}" ${!exam.published ? 'published for students' : 'unpublished'}.`
      );
      fetchInitialData();
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update publication status.');
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this examination?')) return;
    try {
      await examinationApi.delete(id);
      setSuccessBanner('Examination successfully deleted.');
      fetchInitialData();
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete examination.');
    }
  };

  // Enter Marks
  const openMarksModal = async (exam: Examination) => {
    setSelectedExam(exam);
    setMarksModalOpen(true);
    setMarksLoading(true);
    setMarksError('');

    try {
      const [enrRes, marksRes] = await Promise.all([
        enrollmentApi.getByCourse(exam.courseId),
        examinationApi.getMarks(exam.id),
      ]);

      setEnrolledStudents(enrRes.data);

      const existingMarks: Record<number, { marksObtained: number; remarks: string }> = {};
      marksRes.data.forEach((m) => {
        existingMarks[m.studentId] = {
          marksObtained: m.marksObtained,
          remarks: m.remarks || '',
        };
      });

      enrRes.data.forEach((enr) => {
        if (!existingMarks[enr.studentId]) {
          existingMarks[enr.studentId] = { marksObtained: 0, remarks: '' };
        }
      });

      setMarksMap(existingMarks);
    } catch (err) {
      console.error('Failed to load students or marks', err);
      setMarksError('Failed to load student roster for grading.');
    } finally {
      setMarksLoading(false);
    }
  };

  const handleMarkChange = (studentId: number, field: 'marksObtained' | 'remarks', value: any) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: field === 'marksObtained' ? parseFloat(value) || 0 : value,
      },
    }));
  };

  const handleMarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    setMarksSubmitting(true);
    setMarksError('');

    try {
      const markItems = enrolledStudents.map((enr) => ({
        studentId: enr.studentId,
        marksObtained: marksMap[enr.studentId]?.marksObtained || 0,
        remarks: marksMap[enr.studentId]?.remarks || '',
      }));

      await examinationApi.enterMarks({
        examinationId: selectedExam.id,
        marksList: markItems,
        marks: markItems,
      });

      setSuccessBanner(`Grades successfully saved for "${selectedExam.title}".`);
      setMarksModalOpen(false);
      fetchInitialData();
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (err: any) {
      setMarksError(err.response?.data?.message || 'Failed to save marks.');
    } finally {
      setMarksSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? 'My Examination Results' : 'Examinations & Grading'}
        description={
          isStudent
            ? 'View your published academic examination scores, percentages, and faculty evaluations.'
            : 'Schedule examination dates, enter student grading sheets, and publish official scores.'
        }
        actions={
          !isStudent ? (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Exam
            </button>
          ) : undefined
        }
      />

      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="text-emerald-600 hover:text-emerald-800 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading examination records..." />
        </div>
      ) : isStudent ? (
        studentMarks.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No Published Results"
            description="No examination marks have been published for your enrolled courses yet."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Examination</th>
                    <th className="px-6 py-3.5">Course</th>
                    <th className="px-6 py-3.5 text-center">Score</th>
                    <th className="px-6 py-3.5 text-center">Max Marks</th>
                    <th className="px-6 py-3.5 text-center">Percentage</th>
                    <th className="px-6 py-3.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentMarks.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/75">
                      <td className="px-6 py-4 font-bold text-slate-900">{m.examTitle}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-slate-900 mr-2">{m.courseCode}</span>
                        <span className="text-slate-600">{m.courseTitle}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">{m.marksObtained}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{m.maxMarks}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700">
                          {Number(m.percentage).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 italic text-xs">{m.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* FACULTY / ADMIN VIEW */
        exams.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No Examinations Scheduled"
            description="Create an exam schedule to set test dates, max marks, and enter student grades."
            actionLabel="Schedule First Exam"
            onAction={openCreateModal}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Exam Title</th>
                    <th className="px-6 py-3.5">Course</th>
                    <th className="px-6 py-3.5">Date & Time</th>
                    <th className="px-6 py-3.5 text-center">Duration</th>
                    <th className="px-6 py-3.5 text-center">Max Marks</th>
                    <th className="px-6 py-3.5 text-center">Type</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{exam.title}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-slate-900 mr-2">{exam.courseCode}</span>
                        <span className="text-slate-600">{exam.courseTitle}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{exam.examDate}</span>
                        </div>
                        {exam.startTime && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{exam.startTime}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700 text-xs font-medium">
                        {exam.durationMinutes ? `${exam.durationMinutes} min` : '—'}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900">{exam.maxMarks}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                          {exam.examType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            exam.published
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {exam.published ? (
                            <>
                              <Eye className="w-3 h-3" /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openMarksModal(exam)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors border border-primary-200"
                            title="Enter / Edit Marks"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Grade
                          </button>
                          <button
                            onClick={() => handleTogglePublish(exam)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              exam.published
                                ? 'text-amber-600 hover:bg-amber-50 border-amber-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                            }`}
                            title={exam.published ? 'Unpublish' : 'Publish to Students'}
                          >
                            {exam.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteExam(exam.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Exam"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Schedule Exam Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Schedule Examination</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {courses.length === 0 ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-sm text-slate-600">
                  No courses are configured in the system. An examination must be associated with an existing course.
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"
                >
                  Create a Course First
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title *</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => {
                      setExamTitle(e.target.value);
                      if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
                    }}
                    placeholder="e.g. Midterm Examination Fall 2026"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      fieldErrors.title ? 'border-rose-300' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.title && <p className="text-xs text-rose-600 mt-1">{fieldErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course *</label>
                  <select
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      if (fieldErrors.courseId) setFieldErrors((prev) => ({ ...prev, courseId: '' }));
                    }}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white ${
                      fieldErrors.courseId ? 'border-rose-300' : 'border-slate-300'
                    }`}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.courseId && <p className="text-xs text-rose-600 mt-1">{fieldErrors.courseId}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date *</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => {
                        setExamDate(e.target.value);
                        if (fieldErrors.examDate) setFieldErrors((prev) => ({ ...prev, examDate: '' }));
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        fieldErrors.examDate ? 'border-rose-300' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.examDate && <p className="text-xs text-rose-600 mt-1">{fieldErrors.examDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      min={1}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks *</label>
                    <input
                      type="number"
                      min={1}
                      value={maxMarks}
                      onChange={(e) => {
                        setMaxMarks(Number(e.target.value));
                        if (fieldErrors.maxMarks) setFieldErrors((prev) => ({ ...prev, maxMarks: '' }));
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        fieldErrors.maxMarks ? 'border-rose-300' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.maxMarks && <p className="text-xs text-rose-600 mt-1">{fieldErrors.maxMarks}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value as ExamType)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                      <option value="MIDTERM">Midterm</option>
                      <option value="FINAL">Final</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="PRACTICAL">Practical</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {modalLoading ? 'Scheduling...' : 'Schedule Exam'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Enter Marks Modal */}
      {marksModalOpen && selectedExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Grading Sheet: {selectedExam.title}</h3>
                <p className="text-xs text-slate-500">
                  {selectedExam.courseCode} — Maximum Marks: {selectedExam.maxMarks}
                </p>
              </div>
              <button
                onClick={() => setMarksModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {marksError && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{marksError}</span>
              </div>
            )}

            {marksLoading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="md" message="Loading enrolled students for grading..." />
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-600">
                  No students are enrolled in this course to grade. Please enroll students first.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMarksSubmit} className="space-y-4">
                <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Roll Number</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3 w-28">Score (Max {selectedExam.maxMarks})</th>
                        <th className="px-4 py-3">Remarks / Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {enrolledStudents.map((enr) => {
                        const cur = marksMap[enr.studentId] || { marksObtained: 0, remarks: '' };
                        return (
                          <tr key={enr.id} className="hover:bg-slate-50/75">
                            <td className="px-4 py-2 font-mono text-xs font-bold text-slate-900">
                              {enr.studentRollNumber}
                            </td>
                            <td className="px-4 py-2 font-medium text-slate-900">{enr.studentName}</td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                step="0.5"
                                min={0}
                                max={selectedExam.maxMarks}
                                value={cur.marksObtained}
                                onChange={(e) => handleMarkChange(enr.studentId, 'marksObtained', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-primary-500 font-bold text-center"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="text"
                                placeholder="Optional remarks"
                                value={cur.remarks}
                                onChange={(e) => handleMarkChange(enr.studentId, 'remarks', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-primary-500"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMarksModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={marksSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {marksSubmitting ? 'Saving...' : 'Save Grades'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
