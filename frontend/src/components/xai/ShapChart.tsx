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
      <div className="soc-card py-12 text-center text-xs font-mono text-soc-dim">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-soc-border pb-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            SHAP (SHapley Additive exPlanations)
          </h3>
          <p className="text-xs text-soc-dim font-mono">
            Additive feature attribution against baseline expectation ({data.base_value.toFixed(2)})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="soc-badge bg-soc-purple/15 text-soc-purple border border-soc-purple/30">
            Target: {data.target_class}
          </span>
          <span className="text-xs font-mono text-soc-cyan font-bold">
            Score: {data.prediction_score.toFixed(2)}
          </span>
        </div>
      </div>

      <p className="text-xs text-soc-muted leading-relaxed">
        {data.summary}
      </p>

      {/* Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              domain={[-0.2, 0.6]}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#6B7280"
              tick={{ fill: '#F3F4F6', fontSize: 11 }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                fontSize: '12px',
                color: '#F3F4F6',
              }}
              formatter={(val: number) => [`${val > 0 ? '+' : ''}${val.toFixed(3)} contribution`, 'SHAP']}
            />
            <ReferenceLine x={0} stroke="#4B5563" />
            <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.contribution >= 0 ? '#EF4444' : '#10B981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Value Table */}
      <div className="border-t border-soc-border/60 pt-3">
        <h4 className="text-xs font-mono text-soc-dim uppercase mb-2">Feature Measurements</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.features.map((f) => (
            <div key={f.feature_name} className="p-2 rounded bg-soc-bg border border-soc-border text-xs">
              <span className="text-soc-dim block text-[10px] truncate">{f.feature_name}</span>
              <span className="font-mono text-white font-semibold">{String(f.feature_value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
