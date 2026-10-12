import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/endpoints';
import { ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const AdminSetup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [setupRequired, setSetupRequired] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await authApi.getAdminSetupStatus();
        if (!res.data.setupRequired) {
          setSetupRequired(false);
        }
      } catch {
        // Leave setupRequired as is
      } finally {
        setCheckingStatus(false);
      }
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirm password do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.setupAdmin({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });

      setSuccess('Primary Administrator created successfully! Redirecting...');
      setTimeout(() => {
        login(res.data.token, {
          id: res.data.userId,
          fullName: res.data.fullName,
          email: res.data.email,
          role: res.data.role,
          active: true,
        });
        navigate('/admin');
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to setup administrator. Please check your inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    );
  }

  if (!setupRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Setup Already Completed</h2>
          <p className="text-sm text-slate-600 mb-6">
            The initial administrator account has already been configured in MySQL. Further setup via this portal is disabled for security.
          </p>
          <Link
            to="/login"
            className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-medium text-sm transition-colors shadow-sm"
          >
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-navy-900 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow">
            <ShieldCheck className="w-6 h-6 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Initial Admin Setup</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create the institution's primary root administrator account.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Eleanor Vance"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@campusflow.edu"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Root Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat root password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Administrator Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an administrator?{' '}
          <Link to="/login" className="text-primary-700 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
