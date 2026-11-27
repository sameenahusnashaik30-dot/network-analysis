import React from 'react';
import { ShapExplanation } from '../../types/xai';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface ShapChartProps {
  data: ShapExplanation | null;
  onRefresh?: () => void;
}

export const ShapChart: React.FC<ShapChartProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="soc-card py-12 text-center text-xs font-mono text-slate-400">
        Explanation unavailable — model explanation service not connected
      </div>
    );
  }

  const chartData = data.features.map((f) => ({
    name: f.feature_name,
    contribution: f.contribution,
    value: f.feature_value,
  }));

  return (
    <div className="soc-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            SHAP (SHapley Additive exPlanations)
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            Additive feature attribution against baseline expectation ({data.base_value.toFixed(2)})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Target: {data.target_class}
          </span>
          <span className="text-xs font-mono text-slate-700 font-semibold">
            Score: {data.prediction_score.toFixed(2)}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed font-sans">
        {data.summary}
      </p>

      {/* Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 110, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="#94A3B8"
              tick={{ fill: '#64748B', fontSize: 11 }}
              domain={[-0.2, 0.6]}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94A3B8"
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
              width={130}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#0F172A',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(val: number) => [`${val > 0 ? '+' : ''}${val.toFixed(3)} contribution`, 'SHAP']}
            />
            <ReferenceLine x={0} stroke="#CBD5E1" />
            <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.contribution >= 0 ? '#DC2626' : '#059669'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Value Table */}
      <div className="border-t border-slate-200 pt-3">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Feature Measurements</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.features.map((f) => (
            <div key={f.feature_name} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px] truncate">{f.feature_name}</span>
              <span className="font-mono text-slate-900 font-semibold">{String(f.feature_value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
