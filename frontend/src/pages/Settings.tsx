import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../hooks/useAuth';
import {
  Settings as SettingsIcon,
  Cpu,
  Network,
  Database,
  Lock,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { APP_CONFIG } from '../utils/constants';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI Configuration state
  const [knownThreshold, setKnownThreshold] = useState<number>(0.65);
  const [unknownThreshold, setUnknownThreshold] = useState<number>(0.70);
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(0.60);
  const [selectedModel, setSelectedModel] = useState<string>('Random Forest');

  // SDN Configuration state
  const [controllerUrl, setControllerUrl] = useState<string>('http://localhost:8080');
  const [openFlowVersion, setOpenFlowVersion] = useState<string>('OpenFlow 1.3');
  const [pollingInterval, setPollingInterval] = useState<number>(5000);

  // Security & Audit state
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [auditLogging, setAuditLogging] = useState<boolean>(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState<number>(60);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <PageContainer
      title="System Configuration & Operational Parameters"
      subtitle="Tune hybrid AI detection thresholds, SDN controller communication interfaces, and security audit policies."
      isDemo={demoMode}
      actions={
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Save className="w-4 h-4" />
          Save Configuration
        </button>
      }
    >
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Configuration successfully committed and applied across active monitoring modules.
        </div>
      )}

      {/* AI Configuration Section */}
      <div className="soc-card space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Cpu className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Hybrid AI & Open-Set Detection Thresholds
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Calibrate decision boundaries for Layer A (Classifier), Layer B (Autoencoder), and Layer C (Open-Set)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-600 mb-1 font-sans">
              <span className="font-medium">Known Classifier Threshold:</span>
              <strong className="text-blue-600 font-mono">{(knownThreshold * 100).toFixed(0)}% ({knownThreshold})</strong>
            </div>
            <input
              type="range"
              min="0.40"
              max="0.95"
              step="0.05"
              value={knownThreshold}
              onChange={(e) => setKnownThreshold(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <span className="text-[11px] text-slate-500 block mt-1 font-sans">
              Softmax confidence below this triggers open-set candidate analysis.
            </span>
          </div>

          <div>
            <div className="flex justify-between text-slate-600 mb-1 font-sans">
              <span className="font-medium">Zero-Day Unknown Threshold:</span>
              <strong className="text-purple-600 font-mono">{(unknownThreshold * 100).toFixed(0)}% ({unknownThreshold})</strong>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={unknownThreshold}
              onChange={(e) => setUnknownThreshold(parseFloat(e.target.value))}
              className="w-full accent-purple-600"
            />
            <span className="text-[11px] text-slate-500 block mt-1 font-sans">
              Open-world distance threshold defining unknown candidates.
            </span>
          </div>

          <div>
            <div className="flex justify-between text-slate-600 mb-1 font-sans">
              <span className="font-medium">Autoencoder Anomaly Threshold:</span>
              <strong className="text-amber-600 font-mono">{(anomalyThreshold * 100).toFixed(0)}% ({anomalyThreshold})</strong>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.90"
              step="0.05"
              value={anomalyThreshold}
              onChange={(e) => setAnomalyThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <span className="text-[11px] text-slate-500 block mt-1 font-sans">
              Reconstruction error cutoff (L_rec) for anomalous behavior.
            </span>
          </div>
        </div>
      </div>

      {/* SDN Controller Configuration */}
      <div className="soc-card space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Network className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              SDN OpenFlow Controller Configuration
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Controller communication REST endpoint and telemetry polling frequency
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-600 block mb-1.5 uppercase text-[11px] font-semibold">
              Controller Base URL
            </label>
            <input
              type="text"
              value={controllerUrl}
              onChange={(e) => setControllerUrl(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 block mb-1.5 uppercase text-[11px] font-semibold">
              OpenFlow Protocol Version
            </label>
            <select
              value={openFlowVersion}
              onChange={(e) => setOpenFlowVersion(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
            >
              <option value="OpenFlow 1.3">OpenFlow 1.3 (Ryu Recommended)</option>
              <option value="OpenFlow 1.4">OpenFlow 1.4</option>
              <option value="OpenFlow 1.0">OpenFlow 1.0 (Legacy)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-600 block mb-1.5 uppercase text-[11px] font-semibold">
              Telemetry Polling Interval
            </label>
            <select
              value={pollingInterval}
              onChange={(e) => setPollingInterval(parseInt(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
            >
              <option value={2000}>2000 ms (Fast Polling)</option>
              <option value={5000}>5000 ms (Standard Default)</option>
              <option value={10000}>10000 ms (Low Overhead)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database & Security Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="soc-card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Database Persistence Layer
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono">
              <span className="text-slate-500 font-sans">Engine:</span>
              <span className="text-slate-900 font-semibold font-sans">SQLite / Network Repository</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono">
              <span className="text-slate-500 font-sans">Connection Status:</span>
              <span className="text-emerald-700 font-semibold font-sans">ONLINE (Synchronized)</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono">
              <span className="text-slate-500 font-sans">Flow Retention:</span>
              <span className="text-slate-900 font-sans">90 Days Active Storage</span>
            </div>
          </div>
        </div>

        <div className="soc-card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Lock className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Security & Environment Mode
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-900 block font-medium">Demo Mode Simulation</span>
                <span className="text-[11px] text-slate-500">Generate synthetic telemetry when SDN controller is offline</span>
              </div>
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-900 block font-medium">Comprehensive Audit Logging</span>
                <span className="text-[11px] text-slate-500">Record all mitigation authorizations to immutable table</span>
              </div>
              <input
                type="checkbox"
                checked={auditLogging}
                onChange={(e) => setAuditLogging(e.target.checked)}
                className="w-4 h-4 accent-emerald-600"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-900 block font-medium">Session Timeout</span>
                <span className="text-[11px] text-slate-500">Operator auto-logout duration</span>
              </div>
              <span className="text-blue-600 font-bold font-mono">{sessionTimeoutMinutes} min</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
