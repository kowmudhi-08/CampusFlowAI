import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied (403)</h2>
        <p className="text-sm text-slate-500 mb-6">
          You do not have institutional role authorization to access this private section.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
