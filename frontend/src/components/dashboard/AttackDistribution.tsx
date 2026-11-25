import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AttackDistributionItem } from '../../types/attack';

interface AttackDistributionProps {
  data: AttackDistributionItem[];
}

export const AttackDistribution: React.FC<AttackDistributionProps> = ({ data }) => {
  return (
    <div className="soc-card flex flex-col h-full min-h-[380px]">
      <div className="mb-2">
        <h3 className="text-base font-semibold text-white tracking-wide">Attack Distribution</h3>
        <p className="text-xs text-soc-dim font-mono">Known vs Open-World Attack Classification</p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center relative">
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#111827" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#F3F4F6',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List */}
        <div className="w-full grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-soc-border/60 text-xs">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between px-2 py-1 rounded bg-soc-bg/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-soc-muted truncate">{item.name}</span>
              </div>
              <span className="font-mono text-soc-text font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
