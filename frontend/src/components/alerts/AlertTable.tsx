import React from 'react';
import { Incident } from '../../types/incident';
import { SeverityBadge } from './SeverityBadge';
import { formatTimestamp, resolveDeviceType, resolveSoftwareService } from '../../utils/formatters';
import { Eye, ShieldBan } from 'lucide-react';

interface AlertTableProps {
  incidents: Incident[];
  onInvestigate: (incident: Incident) => void;
  onRequestBlock: (incident: Incident) => void;
}

export const AlertTable: React.FC<AlertTableProps> = ({
  incidents,
  onInvestigate,
  onRequestBlock,
}) => {
  return (
    <div className="soc-card space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold bg-slate-50/50">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Incident ID</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Classification</th>
              <th className="py-2.5 px-3">Source Device & Host</th>
              <th className="py-2.5 px-3">Target Service & Port</th>
              <th className="py-2.5 px-3">Anomaly</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                  No incidents matching criteria.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => {
                const srcDevice = resolveDeviceType(inc.src_ip);
                const dstService = resolveSoftwareService(inc.dst_port, inc.protocol);

                return (
                  <tr key={inc.incident_id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {formatTimestamp(inc.detected_at)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {inc.incident_id}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-semibold text-slate-900">{inc.classification}</span>
                      {inc.is_zero_day_candidate && (
                        <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          CANDIDATE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-900 font-medium">{inc.src_ip}:{inc.src_port}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{srcDevice}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-900 font-medium">{inc.dst_ip}:{inc.dst_port}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{dstService}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={inc.anomaly_score > 0.7 ? 'text-red-600 font-bold' : 'text-slate-600'}>
                        {inc.anomaly_score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-blue-600 font-semibold">
                      {Math.round(inc.confidence * 100)}%
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInvestigate(inc)}
                          className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition text-xs font-medium flex items-center gap-1 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          Investigate
                        </button>
                        <button
                          onClick={() => onRequestBlock(inc)}
                          className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition text-xs font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <ShieldBan className="w-3.5 h-3.5" />
                          Block
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
