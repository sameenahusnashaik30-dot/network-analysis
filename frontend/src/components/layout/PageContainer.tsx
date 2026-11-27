import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  isDemo?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  isDemo = false,
}) => {
  return (
    <div className="min-h-screen pl-64 pt-16 bg-slate-50 text-slate-900 pb-12">
      <div className="max-w-[1720px] mx-auto px-6 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              {isDemo && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                  Simulation Feed
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
        </div>

        {/* Main Body */}
        {children}
      </div>
    </div>
  );
};
