import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/endpoints';
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, checkAdminSetup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    const check = async () => {
      const required = await checkAdminSetup();
      setSetupRequired(required);
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      login(res.data.token, {
        id: res.data.userId,
        fullName: res.data.fullName,
        email: res.data.email,
        role: res.data.role,
        active: true,
        profileId: res.data.profileId,
      });

      // Role-based redirection
      if (res.data.role === 'ADMIN') {
        navigate('/admin');
      } else if (res.data.role === 'FACULTY') {
        navigate('/faculty');
      } else if (res.data.role === 'STUDENT') {
        navigate('/student');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-navy-900 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow">
            <GraduationCap className="w-6 h-6 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CampusFlow AI</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your institutional portal</p>
        </div>

        {setupRequired && (
          <div className="mb-5 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex flex-col gap-1.5">
            <span className="font-semibold">Initial Setup Required</span>
            <span>No administrator account exists yet.</span>
            <Link to="/admin-setup" className="font-bold underline text-amber-900">
              Go to Initial Admin Setup &rarr;
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sreeja@campusflow.edu"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-500">
          New to CampusFlow?{' '}
          <Link to="/register" className="text-primary-700 hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
