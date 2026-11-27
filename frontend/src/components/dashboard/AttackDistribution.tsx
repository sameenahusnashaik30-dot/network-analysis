import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AttackDistributionItem } from '../../types/attack';

interface AttackDistributionProps {
  data: AttackDistributionItem[];
}

export const AttackDistribution: React.FC<AttackDistributionProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col h-full min-h-[380px]">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Attack Distribution</h3>
        <p className="text-xs text-slate-500">Breakdown of classified threat categories</p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center relative">
        <div className="w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '0.375rem',
                  fontSize: '12px',
                  color: '#0F172A',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List */}
        <div className="w-full grid grid-cols-2 gap-1.5 mt-2 pt-3 border-t border-slate-100 text-xs">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between px-2 py-1 rounded bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 truncate mr-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate text-[11px]">{item.name}</span>
              </div>
              <span className="font-mono text-slate-900 font-semibold text-[11px]">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
