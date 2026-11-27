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
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col h-full min-h-[380px]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Network Traffic Overview</h3>
          <p className="text-xs text-slate-500">Normal vs Suspicious vs Malicious flows over time</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md self-start sm:self-auto border border-slate-200">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                selectedRange === r
                  ? 'bg-white text-slate-900 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Area Chart */}
      <div className="flex-1 w-full min-h-[280px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            Loading network telemetry...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSuspicious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorMalicious" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#64748B', fontSize: 11 }} />
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
                stroke="#16A34A"
                fillOpacity={1}
                fill="url(#colorNormal)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="suspicious"
                name="Suspicious Anomaly (fps)"
                stroke="#D97706"
                fillOpacity={1}
                fill="url(#colorSuspicious)"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="malicious"
                name="Confirmed Malicious (fps)"
                stroke="#DC2626"
                fillOpacity={1}
                fill="url(#colorMalicious)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
