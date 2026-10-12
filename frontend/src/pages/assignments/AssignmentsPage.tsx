import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { assignmentApi, courseApi, studentApi } from '../../api/endpoints';
import { Assignment, Course, Submission } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, FileText, CheckCircle2, Calendar, Upload, Check, Trash2, X } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const { role } = useAuth();
  const isStudent = role === 'STUDENT';
  const isAdmin = role === 'ADMIN';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Create Assignment Modal
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [maxMarks, setMaxMarks] = useState<number>(20);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Submit Modal (Student)
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');

  // Review Submissions Modal (Faculty/Admin)
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [reviewAssignment, setReviewAssignment] = useState<Assignment | null>(null);
  const [gradingMarks, setGradingMarks] = useState<Record<number, { marks: number; feedback: string }>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const [aRes, sRes] = await Promise.all([
          assignmentApi.getAll(),
          studentApi.getMySubmissions(),
        ]);
        setAssignments(aRes.data);
        setStudentSubmissions(sRes.data);
      } else {
        const [aRes, cRes] = await Promise.all([
          assignmentApi.getAll(),
          courseApi.getAll(),
        ]);
        setAssignments(aRes.data);
        setCourses(cRes.data);
      }
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isStudent]);

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setCourseId(courses.length > 0 ? courses[0].id.toString() : '');
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setMaxMarks(20);
    setErrorMsg('');
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg('');
    try {
      await assignmentApi.create({
        title,
        description,
        courseId: parseInt(courseId, 10),
        dueDate,
        maxMarks: Number(maxMarks),
      });
      setCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await assignmentApi.delete(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete assignment.');
    }
  };

  // Student Submit
  const openSubmitModal = (a: Assignment) => {
    setSelectedAssignment(a);
    setSubmissionText('');
    setFileUrl('');
    setErrorMsg('');
    setSubmitModalOpen(true);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setModalLoading(true);
    setErrorMsg('');
    try {
      await assignmentApi.submit({
        assignmentId: selectedAssignment.id,
        submissionText,
        fileUrl,
      });
      setSubmitModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Submission failed.');
    } finally {
      setModalLoading(false);
    }
  };

  // Review Submissions
  const openReviewModal = async (a: Assignment) => {
    setReviewAssignment(a);
    setReviewModalOpen(true);
    setModalLoading(true);
    try {
      const res = await assignmentApi.getSubmissions(a.id);
      setSubmissionsList(res.data);
      const map: Record<number, { marks: number; feedback: string }> = {};
      res.data.forEach((sub) => {
        map[sub.id] = {
          marks: sub.marksObtained ?? a.maxMarks,
          feedback: sub.feedback || '',
        };
      });
      setGradingMarks(map);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: number) => {
    const data = gradingMarks[submissionId];
    if (!data) return;

    try {
      await assignmentApi.gradeSubmission(submissionId, {
        marksObtained: Number(data.marks),
        feedback: data.feedback,
      });
      alert('Grade saved!');
      if (reviewAssignment) {
        const res = await assignmentApi.getSubmissions(reviewAssignment.id);
        setSubmissionsList(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save grade.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? 'Course Assignments' : 'Course Assignments & Grading'}
        description={
          isStudent
            ? 'Review assigned project homework, upload submission responses, and view feedback.'
            : 'Publish coursework tasks, set due dates, review student submissions, and award grades.'
        }
        actions={
          !isStudent ? (
            <button
              onClick={openCreateModal}
              disabled={courses.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading assignment listings..." />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Assignments Available"
          description={
            isStudent
              ? 'No assignments have been assigned to your enrolled courses yet.'
              : 'Create an assignment or project prompt for your classes.'
          }
          actionLabel={!isStudent && courses.length > 0 ? 'Create First Assignment' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((a) => {
            const studentSub = studentSubmissions.find((s) => s.assignmentId === a.id);
            return (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-primary-50 text-primary-700 rounded-lg">
                      {a.courseCode}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Max: {a.maxMarks} pts
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-2">{a.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4">{a.description}</p>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: {a.dueDate}</span>
                    </div>
                    {!isStudent && (
                      <div className="flex items-center gap-2">
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submissions: {a.submissionsCount || 0}</span>
                      </div>
                    )}
                  </div>

                  {isStudent && (
                    <div className="pt-3 border-t border-slate-100">
                      {studentSub ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Submitted ({studentSub.status})</span>
                          </div>
                          {studentSub.marksObtained !== undefined && studentSub.marksObtained !== null && (
                            <div className="text-xs text-slate-700">
                              Score:{' '}
                              <span className="font-bold">
                                {studentSub.marksObtained} / {a.maxMarks}
                              </span>
                              {studentSub.feedback && (
                                <p className="text-[11px] text-slate-500 italic mt-0.5">
                                  "{studentSub.feedback}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block text-xs font-medium text-amber-600">
                          Pending Submission
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isStudent ? (
                    <button
                      onClick={() => openSubmitModal(a)}
                      className={`w-full py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
                        studentSub
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {studentSub ? 'Resubmit Work' : 'Submit Assignment'}
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <button
                        onClick={() => openReviewModal(a)}
                        className="px-3 py-1.5 text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
                      >
                        Review Submissions ({a.submissionsCount || 0})
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Create Assignment</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lab Exercise 4: Binary Trees"
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Requirements, submission guidelines, test cases..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
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
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Submit Modal */}
      {submitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Submit Work: {selectedAssignment.title}</h3>
              <button onClick={() => setSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Content / Answer
                </label>
                <textarea
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Paste your source code, explanation, or writeup..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File Attachment / GitHub / Drive Link
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || (!submissionText && !fileUrl)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submissions Modal */}
      {reviewModalOpen && reviewAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Submissions: {reviewAssignment.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Max Marks: {reviewAssignment.maxMarks} • Due Date: {reviewAssignment.dueDate}
                </p>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="md" message="Loading submitted responses..." />
              </div>
            ) : submissionsList.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No submissions have been received for this assignment yet.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {submissionsList.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{sub.studentName}</div>
                        <div className="text-xs font-mono text-slate-500">{sub.studentRollNumber}</div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {sub.status}
                      </span>
                    </div>

                    {sub.submissionText && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {sub.submissionText}
                      </div>
                    )}

                    {sub.fileUrl && (
                      <div className="text-xs">
                        <span className="text-slate-500 mr-1">Attachment:</span>
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:underline font-medium"
                        >
                          {sub.fileUrl}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="text-[10px] uppercase font-semibold text-slate-500 block">
                          Marks Awarded
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={reviewAssignment.maxMarks}
                          value={gradingMarks[sub.id]?.marks ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setGradingMarks((prev) => ({
                              ...prev,
                              [sub.id]: {
                                marks: val,
                                feedback: prev[sub.id]?.feedback || '',
                              },
                            }));
                          }}
                          className="w-20 px-2 py-1 text-sm border border-slate-300 rounded font-semibold text-center focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="text-[10px] uppercase font-semibold text-slate-500 block">
                          Feedback Remarks
                        </label>
                        <input
                          type="text"
                          placeholder="Good analysis, well tested..."
                          value={gradingMarks[sub.id]?.feedback ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGradingMarks((prev) => ({
                              ...prev,
                              [sub.id]: {
                                marks: prev[sub.id]?.marks ?? 0,
                                feedback: val,
                              },
                            }));
                          }}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-primary-500"
                        />
                      </div>

                      <div className="self-end">
                        <button
                          type="button"
                          onClick={() => handleGradeSubmission(sub.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
