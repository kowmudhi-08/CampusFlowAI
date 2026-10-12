import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { authApi } from '../../api/endpoints';
import { UserProfileResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Phone, MapPin, Building, Check, KeyRound } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Contact Info state
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [qualification, setQualification] = useState<string>('');
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [profileSuccess, setProfileSuccess] = useState<string>('');
  const [profileError, setProfileError] = useState<string>('');

  // Password state
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [pwdSaving, setPwdSaving] = useState<boolean>(false);
  const [pwdSuccess, setPwdSuccess] = useState<string>('');
  const [pwdError, setPwdError] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authApi.getMe();
      setProfile(res.data);
      setPhone(res.data.phone || '');
      setAddress(res.data.address || '');
      setQualification(res.data.qualification || '');
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      await authApi.updateProfile({
        phone,
        address,
        qualification,
      });
      setProfileSuccess('Profile contact details updated successfully.');
      fetchProfile();
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdSaving(true);
    try {
      await authApi.changePassword({
        oldPassword,
        newPassword,
      });
      setPwdSuccess('Your password has been changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Account Profile"
        description="View your institutional credentials, update contact information, and manage account security."
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" message="Loading profile..." />
        </div>
      ) : profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-3xl mb-4 shadow-inner">
              {profile.fullName.charAt(0)}
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{profile.fullName}</h3>
            <p className="text-xs text-slate-500 mb-3">{profile.email}</p>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 mb-6">
              Role: {profile.role}
            </span>

            <div className="w-full text-left space-y-3 pt-4 border-t border-slate-100 text-xs">
              {profile.code && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">
                    {profile.role === 'STUDENT' ? 'Roll Number' : 'Employee Code'}
                  </span>
                  <span className="font-mono font-semibold text-slate-900">{profile.code}</span>
                </div>
              )}

              {profile.departmentName && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Department</span>
                  <span className="font-semibold text-slate-900">{profile.departmentName}</span>
                </div>
              )}

              {profile.batchYear && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Batch Year</span>
                  <span className="font-semibold text-slate-900">{profile.batchYear}</span>
                </div>
              )}

              {profile.cgpa !== undefined && profile.cgpa !== null && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">CGPA</span>
                  <span className="font-semibold text-slate-900">
                    {Number(profile.cgpa).toFixed(2)}
                  </span>
                </div>
              )}

              {profile.designation && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Designation</span>
                  <span className="font-semibold text-slate-900">{profile.designation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Forms Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Update Info Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-600" />
                Contact Information
              </h4>

              {profileSuccess && (
                <div className="p-3 mb-4 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3 mb-4 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-0100"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {profile.role === 'FACULTY' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Academic Qualification
                      </label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="Ph.D., M.Tech"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mailing Address
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Residential address..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary-600" />
                Change Password
              </h4>

              {pwdSuccess && (
                <div className="p-3 mb-4 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              {pwdError && (
                <div className="p-3 mb-4 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-lg">
                  {pwdError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={pwdSaving}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {pwdSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
