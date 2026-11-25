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
    <div className="min-h-screen pl-64 pt-16 bg-soc-bg text-soc-text pb-12">
      <div className="max-w-[1720px] mx-auto px-6 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-soc-border/60">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">{title}</h2>
              {isDemo && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider font-semibold">
                  Demo Simulated Feed
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-soc-muted mt-1 max-w-3xl">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
        </div>

        {/* Main Body */}
        {children}
      </div>
    </div>
  );
};
