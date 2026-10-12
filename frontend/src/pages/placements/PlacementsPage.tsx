import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { placementApi, studentApi } from '../../api/endpoints';
import { PlacementDrive, PlacementApplication, ApplicationStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Briefcase, Calendar, Award, Building, CheckCircle2, Clock, X, Trash2, Users } from 'lucide-react';

export const PlacementsPage: React.FC = () => {
  const { role } = useAuth();
  const isStudent = role === 'STUDENT';
  const isAdmin = role === 'ADMIN';

  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [studentApps, setStudentApps] = useState<PlacementApplication[]>([]);
  const [studentCgpa, setStudentCgpa] = useState<number>(0.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'drives' | 'my-applications'>('drives');

  // Create Drive Modal (Admin)
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState<string>('');
  const [minCgpa, setMinCgpa] = useState<number>(6.0);
  const [packageDetails, setPackageDetails] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Apply Modal (Student)
  const [applyModalOpen, setApplyModalOpen] = useState<boolean>(false);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');

  // Manage Applications Modal (Admin)
  const [appsModalOpen, setAppsModalOpen] = useState<boolean>(false);
  const [activeDrive, setActiveDrive] = useState<PlacementDrive | null>(null);
  const [driveApplications, setDriveApplications] = useState<PlacementApplication[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        const [dRes, aRes, meRes] = await Promise.all([
          placementApi.getActiveDrives(),
          studentApi.getMyApplications(),
          studentApi.getMyCourses(), // we can also get user profile
        ]);
        setDrives(dRes.data);
        setStudentApps(aRes.data);
      } else {
        const dRes = await placementApi.getAllDrives();
        setDrives(dRes.data);
      }
    } catch (err) {
      console.error('Failed to load placement data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isStudent]);

  const openCreateModal = () => {
    setCompanyName('');
    setJobTitle('');
    setJobDescription('');
    setEligibilityCriteria('');
    setMinCgpa(6.0);
    setPackageDetails('');
    setDeadline(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setErrorMsg('');
    setCreateModalOpen(true);
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg('');
    try {
      await placementApi.createDrive({
        companyName,
        jobTitle,
        jobDescription,
        eligibilityCriteria,
        minCgpa: Number(minCgpa),
        packageDetails,
        deadline,
        active: true,
      });
      setCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create placement drive.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteDrive = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this placement drive?')) return;
    try {
      await placementApi.deleteDrive(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete placement drive.');
    }
  };

  // Student Apply
  const openApplyModal = (d: PlacementDrive) => {
    setSelectedDrive(d);
    setResumeUrl('');
    setErrorMsg('');
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrive) return;

    setModalLoading(true);
    setErrorMsg('');
    try {
      await placementApi.apply({
        placementDriveId: selectedDrive.id,
        resumeUrl,
      });
      setApplyModalOpen(false);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Application failed.');
    } finally {
      setModalLoading(false);
    }
  };

  // Admin View Applications
  const openApplicationsModal = async (d: PlacementDrive) => {
    setActiveDrive(d);
    setAppsModalOpen(true);
    setModalLoading(true);
    try {
      const res = await placementApi.getDriveApplications(d.id);
      setDriveApplications(res.data);
    } catch (err) {
      console.error('Failed to load drive applications', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateAppStatus = async (appId: number, status: ApplicationStatus) => {
    try {
      await placementApi.updateApplicationStatus(appId, { status });
      if (activeDrive) {
        const res = await placementApi.getDriveApplications(activeDrive.id);
        setDriveApplications(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update candidate status.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Placements & Career Cell"
        description="Connect graduating students with corporate recruiters, coordinate recruitment drives, and track job offers."
        actions={
          isAdmin ? (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Placement Drive
            </button>
          ) : undefined
        }
      />

      {isStudent && (
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('drives')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'drives'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Active Recruitment Drives ({drives.length})
          </button>
          <button
            onClick={() => setActiveTab('my-applications')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'my-applications'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            My Applications ({studentApps.length})
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading recruitment drives..." />
        </div>
      ) : isStudent && activeTab === 'my-applications' ? (
        studentApps.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Applications Submitted"
            description="You have not submitted applications to any corporate placement drives yet."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Company</th>
                  <th className="px-6 py-3.5">Job Title</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/75">
                    <td className="px-6 py-4 font-bold text-slate-900">{app.companyName}</td>
                    <td className="px-6 py-4 text-slate-700">{app.jobTitle}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          app.status === 'SELECTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.status === 'SHORTLISTED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : drives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Placement Drives Available"
          description="There are currently no active corporate recruiting drives scheduled."
          actionLabel={isAdmin ? 'Create First Drive' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((d) => {
            const hasApplied = studentApps.some((a) => a.placementDriveId === d.id);
            return (
              <div
                key={d.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-primary-600" />
                      {d.companyName}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Min {Number(d.minCgpa).toFixed(1)} CGPA
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-1">{d.jobTitle}</h3>
                  {d.packageDetails && (
                    <div className="text-xs font-bold text-primary-700 mb-3">
                      Package: {d.packageDetails}
                    </div>
                  )}

                  <p className="text-xs text-slate-500 line-clamp-3 mb-4">{d.jobDescription}</p>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {d.deadline}</span>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Applicants: {d.totalApplications || 0}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {isStudent ? (
                    <button
                      onClick={() => openApplyModal(d)}
                      disabled={hasApplied}
                      className={`w-full py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
                        hasApplied
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {hasApplied ? 'Applied' : 'Apply Now'}
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      <button
                        onClick={() => openApplicationsModal(d)}
                        className="px-3 py-1.5 text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
                      >
                        Candidates ({d.totalApplications || 0})
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteDrive(d.id)}
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

      {/* Create Drive Modal (Admin) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Post New Placement Drive</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateDrive} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Microsoft"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Software Development Engineer"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  rows={3}
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Role overview, responsibilities..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min CGPA Required *</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={10}
                    required
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Package Details</label>
                  <input
                    type="text"
                    value={packageDetails}
                    onChange={(e) => setPackageDetails(e.target.value)}
                    placeholder="e.g. 18 LPA CTC"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline *</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
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
                  Post Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Apply Modal */}
      {applyModalOpen && selectedDrive && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Apply to {selectedDrive.companyName}
              </h3>
              <button onClick={() => setApplyModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">
                  Role: <span className="font-semibold text-slate-900">{selectedDrive.jobTitle}</span>
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Eligibility: Minimum {Number(selectedDrive.minCgpa).toFixed(1)} CGPA required.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume Link (LinkedIn / Google Drive / GitHub)
                </label>
                <input
                  type="url"
                  required
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Applications Review Modal */}
      {appsModalOpen && activeDrive && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Applicants: {activeDrive.companyName} ({activeDrive.jobTitle})
                </h3>
                <p className="text-xs text-slate-500">
                  Minimum CGPA Criteria: {Number(activeDrive.minCgpa).toFixed(1)}
                </p>
              </div>
              <button onClick={() => setAppsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="md" message="Loading applicants..." />
              </div>
            ) : driveApplications.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No students have applied to this placement drive yet.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {driveApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{app.studentName}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {app.studentRollNumber} • CGPA: {Number(app.studentCgpa).toFixed(2)}
                      </div>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary-600 hover:underline mt-1 inline-block"
                        >
                          View Resume Document
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as ApplicationStatus)}
                        className="text-xs font-semibold px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="APPLIED">Applied</option>
                        <option value="SHORTLISTED">Shortlisted</option>
                        <option value="SELECTED">Selected / Offer</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
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
