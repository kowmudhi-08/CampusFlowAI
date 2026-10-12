import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { examinationApi, courseApi, enrollmentApi, studentApi } from '../../api/endpoints';
import { Examination, Course, Mark, Enrollment, ExamType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Award, CheckCircle, Eye, EyeOff, Edit3, X, Trash2 } from 'lucide-react';

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

  // Create Exam Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [examTitle, setExamTitle] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [examType, setExamType] = useState<ExamType>('MIDTERM');
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>('');

  // Enter Marks Modal
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  const [marksMap, setMarksMap] = useState<Record<number, { marksObtained: number; remarks: string }>>({});
  const [marksModalOpen, setMarksModalOpen] = useState<boolean>(false);
  const [marksLoading, setMarksLoading] = useState<boolean>(false);

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

  // Create Exam
  const openCreateModal = () => {
    setExamTitle('');
    setCourseId(courses.length > 0 ? courses[0].id.toString() : '');
    setExamDate(new Date().toISOString().split('T')[0]);
    setMaxMarks(100);
    setExamType('MIDTERM');
    setModalError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    try {
      await examinationApi.create({
        title: examTitle,
        courseId: parseInt(courseId, 10),
        examDate,
        maxMarks: Number(maxMarks),
        examType,
      });
      setIsCreateModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to schedule exam.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleTogglePublish = async (exam: Examination) => {
    try {
      await examinationApi.publish(exam.id, !exam.published);
      fetchInitialData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update publication status.');
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this examination?')) return;
    try {
      await examinationApi.delete(id);
      fetchInitialData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete examination.');
    }
  };

  // Enter Marks
  const openMarksModal = async (exam: Examination) => {
    setSelectedExam(exam);
    setMarksModalOpen(true);
    setMarksLoading(true);
    try {
      // Get enrolled students & existing marks
      const [enrRes, marksRes] = await Promise.all([
        enrollmentApi.getByCourse(exam.courseId),
        examinationApi.getMarks(exam.id),
      ]);
      setEnrolledStudents(enrRes.data);

      const map: Record<number, { marksObtained: number; remarks: string }> = {};
      // Populate existing marks if any
      marksRes.data.forEach((m) => {
        map[m.studentId] = { marksObtained: m.marksObtained, remarks: m.remarks || '' };
      });
      // Set defaults for the rest
      enrRes.data.forEach((e) => {
        if (!map[e.studentId]) {
          map[e.studentId] = { marksObtained: 0, remarks: '' };
        }
      });
      setMarksMap(map);
    } catch (err) {
      console.error('Failed to load roster for marking', err);
    } finally {
      setMarksLoading(false);
    }
  };

  const handleMarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    setMarksLoading(true);
    try {
      const marksPayload = enrolledStudents.map((enr) => ({
        studentId: enr.studentId,
        marksObtained: marksMap[enr.studentId]?.marksObtained || 0,
        remarks: marksMap[enr.studentId]?.remarks || '',
      }));

      await examinationApi.enterMarks({
        examinationId: selectedExam.id,
        marks: marksPayload,
      });

      setMarksModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit marks.');
    } finally {
      setMarksLoading(false);
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
              disabled={courses.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Schedule Exam
            </button>
          ) : undefined
        }
      />

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
                      <td className="px-6 py-4 text-xs text-slate-600">{m.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : exams.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Examinations Scheduled"
          description="Schedule midterms, finals, or quizzes for registered courses."
          actionLabel={courses.length > 0 ? 'Schedule First Exam' : undefined}
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
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-center">Max Marks</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/75">
                    <td className="px-6 py-4 font-bold text-slate-900">{ex.title}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-slate-900 mr-2">{ex.courseCode}</span>
                      <span className="text-slate-600">{ex.courseTitle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                        {ex.examType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{ex.examDate}</td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-900">{ex.maxMarks}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ex.published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ex.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openMarksModal(ex)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Marks
                        </button>
                        <button
                          onClick={() => handleTogglePublish(ex)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            ex.published
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={ex.published ? 'Unpublish Scores' : 'Publish Scores'}
                        >
                          {ex.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteExam(ex.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
      )}

      {/* Schedule Exam Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Schedule Examination</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Examination Title *
                </label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Midterm Examination 1"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course *</label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as ExamType)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="MIDTERM">Midterm</option>
                    <option value="FINAL">Final Exam</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="PRACTICAL">Practical / Lab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date *</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
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
          </div>
        </div>
      )}

      {/* Enter Marks Modal */}
      {marksModalOpen && selectedExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enter Student Marks</h3>
                <p className="text-xs text-slate-500">
                  {selectedExam.title} • {selectedExam.courseCode} (Max Marks: {selectedExam.maxMarks})
                </p>
              </div>
              <button
                onClick={() => setMarksModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {marksLoading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="md" message="Loading enrolled students..." />
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No students enrolled in this course yet.
              </div>
            ) : (
              <form onSubmit={handleMarksSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="space-y-3">
                  {enrolledStudents.map((enr) => {
                    const currentVal = marksMap[enr.studentId]?.marksObtained ?? 0;
                    const currentRemarks = marksMap[enr.studentId]?.remarks ?? '';
                    return (
                      <div
                        key={enr.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{enr.studentName}</div>
                          <div className="text-xs font-mono text-slate-500">{enr.studentRollNumber}</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-semibold text-slate-500 block">
                              Marks
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={selectedExam.maxMarks}
                              value={currentVal}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setMarksMap((prev) => ({
                                  ...prev,
                                  [enr.studentId]: {
                                    marksObtained: val,
                                    remarks: prev[enr.studentId]?.remarks || '',
                                  },
                                }));
                              }}
                              className="w-20 px-2 py-1 text-sm border border-slate-300 rounded font-semibold text-center focus:ring-1 focus:ring-primary-500"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="text-[10px] uppercase font-semibold text-slate-500 block">
                              Feedback
                            </label>
                            <input
                              type="text"
                              placeholder="Feedback / notes"
                              value={currentRemarks}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMarksMap((prev) => ({
                                  ...prev,
                                  [enr.studentId]: {
                                    marksObtained: prev[enr.studentId]?.marksObtained || 0,
                                    remarks: val,
                                  },
                                }));
                              }}
                              className="w-40 px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMarksModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={marksLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    Save Grades
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
