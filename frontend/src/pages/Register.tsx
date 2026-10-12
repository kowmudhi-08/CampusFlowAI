import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi, departmentApi } from '../api/endpoints';
import { Department, Role } from '../types';
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Users } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState(''); // Roll Number or Employee Code
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [departments, setDepartments] = useState<Department[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await departmentApi.getAll();
        setDepartments(res.data);
      } catch {
        // If empty, leave empty
      }
    };
    fetchDepts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        role: role as Role,
      };

      if (departmentId !== '') {
        payload.departmentId = Number(departmentId);
      }

      if (role === 'STUDENT') {
        payload.rollNumber = code.trim() || undefined;
      } else {
        payload.employeeCode = code.trim() || undefined;
      }

      await authApi.register(payload);

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-sm text-slate-500 mt-1">Join the CampusFlow AI institutional network</p>
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

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              role === 'STUDENT'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('FACULTY')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              role === 'FACULTY'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Faculty Member
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aditi Sharma"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aditi@campusflow.edu"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {role === 'STUDENT' ? 'Roll Number (Optional)' : 'Employee Code (Optional)'}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={role === 'STUDENT' ? 'e.g. CS2026-042' : 'e.g. FAC-CSE-102'}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          {departments.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
              >
                <option value="">Select Department (Optional)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password *
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
              Confirm Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Account'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-primary-700 hover:underline font-semibold">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
