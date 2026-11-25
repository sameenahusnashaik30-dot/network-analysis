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
  const [selectedModel, setSelectedModel] = useState<string>('XGBoost');

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
      title="System Configuration & Research Parameters"
      subtitle="Tune hybrid AI detection thresholds, SDN controller communication interfaces, and security audit policies."
      isDemo={demoMode}
      actions={
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-soc-cyan hover:bg-soc-cyanGlow text-black font-bold text-xs font-mono transition flex items-center gap-1.5 shadow-lg shadow-cyan-950/40"
        >
          <Save className="w-4 h-4" />
          Save Configuration
        </button>
      }
    >
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          Configuration successfully committed and applied across active modules.
        </div>
      )}

      {/* AI Configuration Section */}
      <div className="soc-card space-y-4">
        <div className="flex items-center gap-2 border-b border-soc-border pb-3">
          <Cpu className="w-5 h-5 text-soc-purple" />
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              Hybrid AI & Open-Set Detection Thresholds
            </h3>
            <p className="text-xs text-soc-dim font-mono">
              Calibrate decision boundaries for Layer A (Classifier), Layer B (Autoencoder), and Layer C (Open-Set)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
          <div>
            <div className="flex justify-between text-soc-dim mb-1">
              <span>Known Classifier Threshold:</span>
              <strong className="text-soc-cyan">{(knownThreshold * 100).toFixed(0)}% ({knownThreshold})</strong>
            </div>
            <input
              type="range"
              min="0.40"
              max="0.95"
              step="0.05"
              value={knownThreshold}
              onChange={(e) => setKnownThreshold(parseFloat(e.target.value))}
              className="w-full accent-soc-cyan"
            />
            <span className="text-[10px] text-soc-dim block mt-1">
              Softmax confidence below this triggers open-set candidate analysis.
            </span>
          </div>

          <div>
            <div className="flex justify-between text-soc-dim mb-1">
              <span>Zero-Day Unknown Threshold:</span>
              <strong className="text-soc-purple">{(unknownThreshold * 100).toFixed(0)}% ({unknownThreshold})</strong>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={unknownThreshold}
              onChange={(e) => setUnknownThreshold(parseFloat(e.target.value))}
              className="w-full accent-soc-purple"
            />
            <span className="text-[10px] text-soc-dim block mt-1">
              Open-world distance threshold defining unknown candidates.
            </span>
          </div>

          <div>
            <div className="flex justify-between text-soc-dim mb-1">
              <span>Autoencoder Anomaly Threshold:</span>
              <strong className="text-amber-400">{(anomalyThreshold * 100).toFixed(0)}% ({anomalyThreshold})</strong>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.90"
              step="0.05"
              value={anomalyThreshold}
              onChange={(e) => setAnomalyThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-400"
            />
            <span className="text-[10px] text-soc-dim block mt-1">
              Reconstruction error cutoff (L_rec) for anomalous behavior.
            </span>
          </div>
        </div>
      </div>

      {/* SDN Controller Configuration */}
      <div className="soc-card space-y-4">
        <div className="flex items-center gap-2 border-b border-soc-border pb-3">
          <Network className="w-5 h-5 text-soc-cyan" />
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              SDN OpenFlow Controller Configuration
            </h3>
            <p className="text-xs text-soc-dim font-mono">
              Controller communication REST endpoint and telemetry polling frequency
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="text-soc-dim block mb-1.5 uppercase text-[11px]">
              Controller Base URL
            </label>
            <input
              type="text"
              value={controllerUrl}
              onChange={(e) => setControllerUrl(e.target.value)}
              className="w-full bg-soc-bg border border-soc-border rounded-lg p-2.5 text-white focus:outline-none focus:border-soc-cyan"
            />
          </div>

          <div>
            <label className="text-soc-dim block mb-1.5 uppercase text-[11px]">
              OpenFlow Protocol Version
            </label>
            <select
              value={openFlowVersion}
              onChange={(e) => setOpenFlowVersion(e.target.value)}
              className="w-full bg-soc-bg border border-soc-border rounded-lg p-2.5 text-white focus:outline-none focus:border-soc-cyan"
            >
              <option value="OpenFlow 1.3">OpenFlow 1.3 (Ryu Recommended)</option>
              <option value="OpenFlow 1.4">OpenFlow 1.4</option>
              <option value="OpenFlow 1.0">OpenFlow 1.0 (Legacy)</option>
            </select>
          </div>

          <div>
            <label className="text-soc-dim block mb-1.5 uppercase text-[11px]">
              Telemetry Polling Interval
            </label>
            <select
              value={pollingInterval}
              onChange={(e) => setPollingInterval(parseInt(e.target.value))}
              className="w-full bg-soc-bg border border-soc-border rounded-lg p-2.5 text-white focus:outline-none focus:border-soc-cyan"
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
          <div className="flex items-center gap-2 border-b border-soc-border pb-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              Database Persistence Layer
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-lg bg-soc-bg border border-soc-border">
              <span className="text-soc-dim">Engine:</span>
              <span className="text-white font-bold">MongoDB / SQLite Repository</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-soc-bg border border-soc-border">
              <span className="text-soc-dim">Connection Status:</span>
              <span className="text-emerald-400 font-bold">ONLINE (Synchronized)</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-soc-bg border border-soc-border">
              <span className="text-soc-dim">Flow Retention:</span>
              <span className="text-white">90 Days Active Storage</span>
            </div>
          </div>
        </div>

        <div className="soc-card space-y-4">
          <div className="flex items-center gap-2 border-b border-soc-border pb-3">
            <Lock className="w-5 h-5 text-soc-purple" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              Security & Environment Mode
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-soc-bg border border-soc-border">
              <div>
                <span className="text-white block font-medium">Demo Mode Simulation</span>
                <span className="text-[10px] text-soc-dim">Generate synthetic flows when backend is offline</span>
              </div>
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="w-4 h-4 accent-soc-cyan"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-soc-bg border border-soc-border">
              <div>
                <span className="text-white block font-medium">Comprehensive Audit Logging</span>
                <span className="text-[10px] text-soc-dim">Record mitigation authorizations to immutable table</span>
              </div>
              <input
                type="checkbox"
                checked={auditLogging}
                onChange={(e) => setAuditLogging(e.target.checked)}
                className="w-4 h-4 accent-emerald-400"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-soc-bg border border-soc-border">
              <div>
                <span className="text-white block font-medium">JWT Session Timeout</span>
                <span className="text-[10px] text-soc-dim">Auto-logout duration</span>
              </div>
              <span className="text-soc-cyan font-bold">{sessionTimeoutMinutes} min</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
