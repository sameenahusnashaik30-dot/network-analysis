import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  colorVariant?: 'blue' | 'purple' | 'red' | 'green' | 'orange' | 'cyan';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  isPositive,
  colorVariant = 'blue',
}) => {
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600 border border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border border-purple-100',
    red: 'bg-red-50 text-red-600 border border-red-100',
    green: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    orange: 'bg-amber-50 text-amber-600 border border-amber-100',
    cyan: 'bg-sky-50 text-sky-600 border border-sky-100',
  };

  const badgeStyle = iconColors[colorVariant] || iconColors.blue;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-medium text-slate-500">{title}</span>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1 font-mono">{value}</div>
        </div>
        <div className={`p-2 rounded-md ${badgeStyle}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate mr-2">{subtitle}</span>
        {change && (
          <span
            className={`font-medium flex-shrink-0 text-[11px] ${
              isPositive ? 'text-emerald-700' : 'text-slate-600'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
