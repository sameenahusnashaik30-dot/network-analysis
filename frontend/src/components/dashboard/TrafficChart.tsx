import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrafficHistoryPoint } from '../../types/flow';

interface TrafficChartProps {
  data: TrafficHistoryPoint[];
  selectedRange: '1H' | '6H' | '24H' | '7D';
  onRangeChange: (range: '1H' | '6H' | '24H' | '7D') => void;
  isLoading?: boolean;
}

export const TrafficChart: React.FC<TrafficChartProps> = ({
  data,
  selectedRange,
  onRangeChange,
  isLoading,
}) => {
  const ranges: ('1H' | '6H' | '24H' | '7D')[] = ['1H', '6H', '24H', '7D'];

  return (
    <div className="soc-card flex flex-col h-full min-h-[380px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-wide">Network Traffic Overview</h3>
          <p className="text-xs text-soc-dim font-mono">OpenFlow Telemetry: Normal vs Suspicious vs Malicious</p>
        </div>

        <div className="flex items-center gap-1 bg-soc-bg border border-soc-border p-1 rounded-lg self-start sm:self-auto">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1 rounded text-xs font-mono transition font-medium ${
                selectedRange === r
                  ? 'bg-soc-cyan text-black font-bold shadow'
                  : 'text-soc-muted hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="flex-1 w-full min-h-[280px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-soc-dim text-xs font-mono">
            Loading telemetry metrics...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorMalicious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#F3F4F6',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="normal"
                name="Normal Traffic (fps)"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorNormal)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="suspicious"
                name="Suspicious Anomaly (fps)"
                stroke="#F59E0B"
                fillOpacity={1}
                fill="url(#colorSuspicious)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="malicious"
                name="Confirmed Malicious (fps)"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#colorMalicious)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
