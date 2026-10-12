import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, actions }) => {
  const actionContent = action || actions;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actionContent && <div className="mt-4 sm:mt-0 flex items-center gap-3">{actionContent}</div>}
    </div>
  );
};

