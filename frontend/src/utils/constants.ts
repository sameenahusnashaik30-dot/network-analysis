const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const defaultWs = typeof window !== 'undefined' ? `${isHttps ? 'wss:' : 'ws:'}//${window.location.host}/ws` : 'ws://localhost:8000/ws';

export const APP_CONFIG = {
  appName: 'SENTINEL-X',
  appTitle: 'Trustworthy Open-World Zero-Day Attack Detection in Software-Defined Networks',
  version: '1.0.0-PROTOTYPE',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  wsUrl: import.meta.env.VITE_WS_URL || defaultWs,
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
};

export const ATTACK_COLORS: Record<string, string> = {
  'Normal': '#16A34A',       // Green
  'DDoS': '#DC2626',         // Crimson
  'DoS': '#EA580C',          // Orange
  'Port Scan': '#D97706',    // Amber
  'Brute Force': '#9333EA',  // Purple
  'Botnet': '#7C3AED',       // Violet
  'Web Attack': '#2563EB',   // Blue
  'Unknown Attack': '#0284C7', // Sky Blue
  'Zero-Day Candidate': '#7E22CE', // Deep Purple
};

export const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-50 text-red-700 border border-red-200',
  HIGH: 'bg-orange-50 text-orange-700 border border-orange-200',
  MEDIUM: 'bg-amber-50 text-amber-800 border border-amber-200',
  LOW: 'bg-blue-50 text-blue-700 border border-blue-200',
  INFO: 'bg-slate-100 text-slate-700 border border-slate-200',
};
