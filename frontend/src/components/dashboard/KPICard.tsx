import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  colorVariant?: 'cyan' | 'purple' | 'red' | 'green' | 'orange';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  isPositive,
  colorVariant = 'cyan',
}) => {
  const colorMap = {
    cyan: {
      border: 'hover:border-soc-cyan/40',
      iconBg: 'bg-soc-cyan/15 text-soc-cyan border-soc-cyan/30',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.08)]',
    },
    purple: {
      border: 'hover:border-soc-purple/40',
      iconBg: 'bg-soc-purple/15 text-soc-purple border-soc-purple/30',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.08)]',
    },
    red: {
      border: 'hover:border-soc-red/40',
      iconBg: 'bg-soc-red/15 text-soc-red border-soc-red/30',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.08)]',
    },
    green: {
      border: 'hover:border-soc-green/40',
      iconBg: 'bg-soc-green/15 text-soc-green border-soc-green/30',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.08)]',
    },
    orange: {
      border: 'hover:border-soc-orange/40',
      iconBg: 'bg-soc-orange/15 text-soc-orange border-soc-orange/30',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.08)]',
    },
  };

  const style = colorMap[colorVariant];

  return (
    <div
      className={`soc-card soc-card-hover ${style.border} ${style.glow} flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-mono text-soc-muted">{title}</span>
          <div className="text-2xl font-bold tracking-tight text-white mt-1 font-mono">{value}</div>
        </div>
        <div className={`p-2.5 rounded-lg border ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-4 pt-3 border-t border-soc-border/60 flex items-center justify-between text-xs">
          {subtitle && <span className="text-soc-dim">{subtitle}</span>}
          {change && (
            <span
              className={`font-mono font-medium ${
                isPositive ? 'text-soc-green' : 'text-soc-red'
              }`}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
