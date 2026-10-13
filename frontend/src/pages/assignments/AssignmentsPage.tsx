import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { assignmentApi, courseApi, studentApi } from '../../api/endpoints';
import { Assignment, Course, Submission } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, FileText, CheckCircle2, Calendar, Upload, Check, Trash2, X, AlertCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AssignmentsPage: React.FC = () => {
  const { role } = useAuth();
  const isStudent = role === 'STUDENT';
  const isAdmin = role === 'ADMIN';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successBanner, setSuccessBanner] = useState<string>('');

  // Create Assignment Modal
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [maxMarks, setMaxMarks] = useState<number>(20);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const openCreateModal = async () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setMaxMarks(20);
    setErrorMsg('');
    setFieldErrors({});
    setCreateModalOpen(true);

    try {
      const res = await courseApi.getAll();
      setCourses(res.data);
      if (res.data.length > 0) {
        setCourseId(res.data[0].id.toString());
      } else {
        setCourseId('');
      }
    } catch (err) {
      console.error('Failed to reload courses for assignments', err);
    }
  };

  const validateAssignmentForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 2) {
      errs.title = 'Title is required (minimum 2 characters).';
    }
    if (!description.trim()) {
      errs.description = 'Assignment instructions/description is required.';
    }
    if (!courseId) {
      errs.courseId = 'Please select a course.';
    }
    if (!dueDate) {
      errs.dueDate = 'Due date is required.';
    }
    if (!maxMarks || maxMarks <= 0) {
      errs.maxMarks = 'Max marks must be greater than 0.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateAssignmentForm()) {
      return;
    }

    setModalLoading(true);
    try {
      // Send date formatted with time to ensure ISO standard compatibility
      const isoDueDate = dueDate.includes('T') ? dueDate : `${dueDate}T23:59:59`;

      await assignmentApi.create({
        title: title.trim(),
        description: description.trim(),
        courseId: parseInt(courseId, 10),
        dueDate: isoDueDate,
        maxMarks: Number(maxMarks),
      });

      setSuccessBanner(`Assignment "${title.trim()}" created successfully!`);
      setCreateModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessBanner(''), 6000);
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
      setSuccessBanner('Assignment deleted successfully.');
      fetchData();
      setTimeout(() => setSuccessBanner(''), 5000);
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
      setSuccessBanner('Assignment submitted successfully!');
      setSubmitModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Submission failed.');
    } finally {
      setModalLoading(false);
    }
  };

  // Faculty Review
  const openReviewModal = async (a: Assignment) => {
    setReviewAssignment(a);
    setReviewModalOpen(true);
    try {
      const res = await assignmentApi.getSubmissions(a.id);
      setSubmissionsList(res.data);
      const initGrading: Record<number, { marks: number; feedback: string }> = {};
      res.data.forEach((s) => {
        initGrading[s.id] = {
          marks: s.marksObtained || 0,
          feedback: s.feedback || '',
        };
      });
      setGradingMarks(initGrading);
    } catch (err) {
      console.error('Failed to load submissions', err);
    }
  };

  const handleGradeSubmit = async (submissionId: number) => {
    const data = gradingMarks[submissionId];
    if (!data) return;

    try {
      await assignmentApi.gradeSubmission(submissionId, {
        marksObtained: Number(data.marks),
        feedback: data.feedback,
      });
      setSuccessBanner('Grade and feedback saved successfully!');
      if (reviewAssignment) {
        const res = await assignmentApi.getSubmissions(reviewAssignment.id);
        setSubmissionsList(res.data);
      }
      setTimeout(() => setSuccessBanner(''), 4000);
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
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
          actionLabel={!isStudent ? 'Create First Assignment' : undefined}
          onAction={!isStudent ? openCreateModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => {
            const submission = studentSubmissions.find((s) => s.assignmentId === assignment.id);
            const isSubmitted = !!submission;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 text-slate-800 rounded">
                      {assignment.courseCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Max: {assignment.maxMarks} pts
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-2">{assignment.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">{assignment.description}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Due: {assignment.dueDate ? assignment.dueDate.split('T')[0] : 'No deadline'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isStudent ? (
                    isSubmitted ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Submitted
                        </span>
                        {submission.marksObtained !== undefined && submission.marksObtained !== null && (
                          <span className="text-xs font-bold text-slate-900">
                            Score: {submission.marksObtained}/{assignment.maxMarks}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => openSubmitModal(assignment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Submit Work
                      </button>
                    )
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => openReviewModal(assignment)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        Review Submissions
                      </button>
                      {(isAdmin || role === 'FACULTY') && (
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Assignment"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Create New Course Assignment</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {courses.length === 0 ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-sm text-slate-600">
                  No courses are configured in the system. An assignment must belong to an existing course.
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"
                >
                  <BookOpen className="w-4 h-4" />
                  Create a Course First
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
                    }}
                    placeholder="e.g. Lab 3: Binary Search Tree Implementation"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instructions & Description *
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: '' }));
                    }}
                    placeholder="Describe problem statement, format requirements, deliverables..."
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      fieldErrors.description ? 'border-rose-300' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.description && <p className="text-xs text-rose-600 mt-1">{fieldErrors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        if (fieldErrors.dueDate) setFieldErrors((prev) => ({ ...prev, dueDate: '' }));
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        fieldErrors.dueDate ? 'border-rose-300' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.dueDate && <p className="text-xs text-rose-600 mt-1">{fieldErrors.dueDate}</p>}
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
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {modalLoading ? 'Creating...' : 'Create Assignment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Student Submit Modal */}
      {submitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Submit: {selectedAssignment.title}</h3>
              <button
                onClick={() => setSubmitModalOpen(false)}
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

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Notes / Code / Text
                </label>
                <textarea
                  rows={4}
                  required
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Paste your solution or summary here..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attachment Link (Optional)
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
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {modalLoading ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Review Submissions Modal */}
      {reviewModalOpen && reviewAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Submissions: {reviewAssignment.title}
                </h3>
                <p className="text-xs text-slate-500">Max Marks: {reviewAssignment.maxMarks}</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submissionsList.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                No students have submitted this assignment yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {submissionsList.map((sub) => {
                  const gradeInfo = gradingMarks[sub.id] || { marks: 0, feedback: '' };
                  return (
                    <div key={sub.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{sub.studentName}</div>
                          <div className="text-xs font-mono text-slate-500">{sub.studentRollNumber}</div>
                        </div>
                        <span className="text-xs text-slate-400">
                          Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 whitespace-pre-wrap">
                        {sub.submissionText}
                      </div>

                      {sub.fileUrl && (
                        <div className="text-xs">
                          <span className="text-slate-500 mr-2">Attachment:</span>
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            {sub.fileUrl}
                          </a>
                        </div>
                      )}

                      <div className="pt-2 flex flex-col md:flex-row gap-3 items-end">
                        <div className="w-full md:w-32">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Score (Max {reviewAssignment.maxMarks})
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            max={reviewAssignment.maxMarks}
                            value={gradeInfo.marks}
                            onChange={(e) =>
                              setGradingMarks((prev) => ({
                                ...prev,
                                [sub.id]: {
                                  ...prev[sub.id],
                                  marks: parseFloat(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-full px-2 py-1 text-sm border border-slate-300 rounded font-bold"
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Feedback
                          </label>
                          <input
                            type="text"
                            placeholder="Add evaluation comments..."
                            value={gradeInfo.feedback}
                            onChange={(e) =>
                              setGradingMarks((prev) => ({
                                ...prev,
                                [sub.id]: {
                                  ...prev[sub.id],
                                  feedback: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleGradeSubmit(sub.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors whitespace-nowrap h-8"
                        >
                          Save Grade
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
