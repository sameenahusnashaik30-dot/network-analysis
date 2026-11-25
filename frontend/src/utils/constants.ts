export const APP_CONFIG = {
  appName: 'SENTINEL-X',
  appTitle: 'Trustworthy Open-World Zero-Day Attack Detection in SDN',
  version: '1.0.0-PROTOTYPE',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
};

export const ATTACK_COLORS: Record<string, string> = {
  'Normal': '#10B981',       // Green
  'DDoS': '#EF4444',         // Red
  'DoS': '#F97316',          // Orange
  'Port Scan': '#F59E0B',    // Amber
  'Brute Force': '#EC4899',  // Pink
  'Botnet': '#8B5CF6',       // Purple
  'Web Attack': '#3B82F6',   // Blue
  'Unknown Attack': '#06B6D4', // Cyan
  'Zero-Day Candidate': '#A855F7', // Magenta/Purple
};

export const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  INFO: 'bg-soc-dim/10 text-soc-muted border-soc-border',
};
