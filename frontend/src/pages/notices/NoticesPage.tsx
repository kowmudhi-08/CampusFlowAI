import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { noticeApi } from '../../api/endpoints';
import { Notice, NoticeAudience } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Bell, Calendar, User, Trash2, X, Filter } from 'lucide-react';

export const NoticesPage: React.FC = () => {
  const { role } = useAuth();
  const canPost = role === 'ADMIN' || role === 'FACULTY';
  const isAdmin = role === 'ADMIN';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [audience, setAudience] = useState<NoticeAudience>('ALL');
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await noticeApi.getFeed();
      setNotices(res.data);
    } catch (err) {
      console.error('Failed to load notices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openCreateModal = () => {
    setTitle('');
    setContent('');
    setAudience('ALL');
    setErrorMsg('');
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setErrorMsg('');
    try {
      await noticeApi.create({
        title,
        content,
        audience,
        active: true,
      });
      setCreateModalOpen(false);
      fetchNotices();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to post notice.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await noticeApi.delete(id);
      fetchNotices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete notice.');
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (selectedAudience === 'ALL') return true;
    return n.audience === selectedAudience || n.audience === 'ALL';
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Notice Board"
        description="Official institutional circulars, academic memos, event briefings, and department updates."
        actions={
          canPost ? (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post Notice
            </button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <Filter className="w-4 h-4 text-slate-400 mr-2" />
        {(['ALL', 'STUDENTS', 'FACULTY'] as const).map((aud) => (
          <button
            key={aud}
            onClick={() => setSelectedAudience(aud)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              selectedAudience === aud
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {aud === 'ALL' ? 'All Audiences' : aud === 'STUDENTS' ? 'For Students' : 'For Faculty'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading campus notices..." />
        </div>
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notices Published"
          description="There are currently no active announcements or bulletins on the campus notice board."
          actionLabel={canPost ? 'Post First Notice' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotices.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      n.audience === 'ALL'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : n.audience === 'STUDENTS'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    Audience: {n.audience}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-3">{n.title}</h3>
                <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed mb-6">
                  {n.content}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Posted by: {n.createdByName || 'Administration'}</span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Post Announcement Notice</h3>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. End-Semester Examination Schedule Published"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as NoticeAudience)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="ALL">All Campus (Everyone)</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="FACULTY">Faculty Members Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Details *</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write announcement body..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 leading-relaxed"
                />
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
                  {modalLoading ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
