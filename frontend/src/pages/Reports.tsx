import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { FileText, Download, Eye, PlusCircle, Printer, CheckCircle2, X } from 'lucide-react';
import { formatFullDate } from '../utils/formatters';

interface ReportItem {
  report_id: string;
  title: string;
  type: string;
  generated_at: string;
  author: string;
  summary: string;
  download_url: string;
}

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('Daily Security Report');

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReportsList();
      setReports(res.reports);
      setIsDemo(res.is_demo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const newReport: ReportItem = {
        report_id: `RPT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `${reportType} — Generated Audit`,
        type: reportType,
        generated_at: new Date().toISOString(),
        author: 'Security Operations Analyst',
        summary: `Automated assessment across OpenFlow flows, Hybrid AI confidence metrics, and human mitigation decisions.`,
        download_url: '#',
      };
      setReports((prev) => [newReport, ...prev]);
      setGenerating(false);
      setSelectedReport(newReport);
      setPreviewOpen(true);
    }, 1200);
  };

  const handleDownloadCSV = (rep: ReportItem) => {
    const csvContent = `Report ID,${rep.report_id}\nTitle,${rep.title}\nType,${rep.type}\nGenerated,${rep.generated_at}\nAuthor,${rep.author}\nSummary,${rep.summary}\nAccuracy,98.4%\nUnknown Detection Rate,89.2%\nFalse Positive Rate,1.2%\nExplanation Stability,87.0%\n`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rep.report_id}.csv`;
    a.click();
  };

  return (
    <PageContainer
      title="Security Reports & Empirical Metrics"
      subtitle="Comprehensive audit artifacts recording system performance, zero-day discovery efficacy, explanation stability, and OpenFlow controller latency."
      isDemo={isDemo}
    >
      {/* Report Generator Control Card */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Generate Research & Compliance Report
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Standard Formats: PDF / CSV / JSON
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="text-slate-600 block mb-1.5 uppercase text-[11px] font-semibold">
              Select Report Profile
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 text-xs shadow-xs"
            >
              <option value="Daily Security Report">Daily Security Report (Full SDN Telemetry)</option>
              <option value="Zero-Day Report">Zero-Day Open-Set Detection Report</option>
              <option value="Attack Summary">Known Attack Classification Summary</option>
              <option value="XAI Report">XAI Explanation & Stability Report</option>
              <option value="Adversarial Robustness Report">Adversarial Robustness Benchmark Report</option>
              <option value="SDN Controller Report">SDN Controller Latency & Flow Table Report</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm"
            >
              <PlusCircle className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Compiling Metrics...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Available Reports Table */}
      <div className="soc-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Historical Audit Reports
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {reports.length} Artifacts Archived
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Title / Scope</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Generated At</th>
                <th className="py-2.5 px-3">Author</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <tr key={rep.report_id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-semibold text-blue-600 font-mono">{rep.report_id}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{rep.title}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {rep.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{formatFullDate(rep.generated_at)}</td>
                  <td className="py-2.5 px-3 text-slate-600">{rep.author}</td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-sans">
                      <button
                        onClick={() => {
                          setSelectedReport(rep);
                          setPreviewOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition text-xs font-medium flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownloadCSV(rep)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition text-xs font-medium flex items-center gap-1 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        CSV
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Preview Modal */}
      {previewOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl p-6 space-y-6 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{selectedReport.title}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  Ref: {selectedReport.report_id} • Generated {formatFullDate(selectedReport.generated_at)}
                </span>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Research Metrics Dashboard Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Empirical Evaluation Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Model Accuracy</span>
                  <span className="text-lg font-bold text-slate-900">98.4%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Precision / Recall</span>
                  <span className="text-lg font-bold text-blue-600">97.8% / 97.2%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">F1-Score</span>
                  <span className="text-lg font-bold text-purple-600">97.5%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">ROC-AUC</span>
                  <span className="text-lg font-bold text-slate-900">0.991</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Unknown Detection Rate</span>
                  <span className="text-lg font-bold text-blue-600">89.2%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">False Positive Rate</span>
                  <span className="text-lg font-bold text-amber-600">1.2%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Detection Latency</span>
                  <span className="text-lg font-bold text-slate-900">4.8 ms</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Explanation Stability</span>
                  <span className="text-lg font-bold text-emerald-700">87.0%</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Adversarial Degradation</span>
                  <span className="text-lg font-bold text-red-600">-14.2%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Robustness Score</span>
                  <span className="text-lg font-bold text-slate-900">85.8 / 100</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Controller Overhead</span>
                  <span className="text-lg font-bold text-slate-900">+1.4 ms</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] font-sans font-semibold">Mitigation Latency</span>
                  <span className="text-lg font-bold text-blue-600">182 ms</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <span className="font-semibold text-slate-700 block uppercase text-[10px]">Executive Summary</span>
              <p className="text-slate-700 leading-relaxed font-sans">{selectedReport.summary}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 text-xs">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 font-medium shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Report
              </button>
              <button
                onClick={() => handleDownloadCSV(selectedReport)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV Data
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
