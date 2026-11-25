import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Flame,
  BrainCircuit,
  Network,
  Zap,
  AlertCircle,
  ShieldCheck,
  FileText,
  Settings,
  Lock,
} from 'lucide-react';
import { APP_CONFIG } from '../../utils/constants';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Live Network', path: '/live-network', icon: Activity },
  { name: 'Zero-Day Detection', path: '/zero-day', icon: ShieldAlert, badge: 'HOT', badgeColor: 'bg-soc-cyan/20 text-soc-cyan border border-soc-cyan/30' },
  { name: 'Known Attacks', path: '/known-attacks', icon: Flame },
  { name: 'Explainable AI', path: '/xai', icon: BrainCircuit },
  { name: 'SDN Controller', path: '/sdn-controller', icon: Network },
  { name: 'Adversarial Testing', path: '/adversarial', icon: Zap },
  { name: 'Incidents', path: '/incidents', icon: AlertCircle, badge: '5', badgeColor: 'bg-soc-red/20 text-soc-red border border-soc-red/30' },
  { name: 'Mitigation', path: '/mitigation', icon: ShieldCheck },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-soc-panel border-r border-soc-border flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-soc-border bg-soc-panel/80 backdrop-blur">
        <div className="w-9 h-9 rounded-lg bg-soc-bg border border-soc-cyan/40 flex items-center justify-center p-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
          <img src="/logo.svg" alt="SENTINEL-X" className="w-full h-full" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-wider text-white">SENTINEL</span>
            <span className="font-bold text-lg text-soc-cyan">-X</span>
          </div>
          <p className="text-[10px] text-soc-dim uppercase tracking-wider font-mono">SDN Security SOC</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-soc-dim font-mono">
          Security Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-soc-cyan/15 text-soc-cyan border border-soc-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-soc-muted hover:text-soc-text hover:bg-soc-panelLight/60 hover:border-soc-borderLight'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Controller & Architecture Pill */}
      <div className="p-3 border-t border-soc-border bg-soc-bg/40 text-xs">
        <div className="flex items-center justify-between text-soc-muted mb-1.5">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5 text-soc-cyan" />
            RBAC Enabled
          </span>
          <span className="text-[10px] font-mono text-soc-cyan bg-soc-cyan/10 px-1.5 py-0.5 rounded">
            v{APP_CONFIG.version}
          </span>
        </div>
        <div className="text-[10px] text-soc-dim leading-relaxed">
          OpenFlow 1.3 / Ryu SDN Engine • SHAP + LIME XAI
        </div>
      </div>
    </aside>
  );
};
