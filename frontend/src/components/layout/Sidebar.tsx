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
  { name: 'Zero-Day Detection', path: '/zero-day', icon: ShieldAlert },
  { name: 'Known Attacks', path: '/known-attacks', icon: Flame },
  { name: 'Explainable AI', path: '/xai', icon: BrainCircuit },
  { name: 'SDN Controller', path: '/sdn-controller', icon: Network },
  { name: 'Adversarial Testing', path: '/adversarial', icon: Zap },
  { name: 'Incidents', path: '/incidents', icon: AlertCircle, badge: '5', badgeColor: 'bg-red-50 text-red-700 border border-red-200' },
  { name: 'Mitigation', path: '/mitigation', icon: ShieldCheck },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none shadow-sm">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200 bg-white">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center p-1.5 shadow-sm text-white font-bold">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-slate-900">SENTINEL</span>
            <span className="font-bold text-base text-blue-600">-X</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">SDN Security Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Security Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Security Context Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs">
        <div className="flex items-center justify-between text-slate-600 mb-1">
          <span className="flex items-center gap-1.5 text-[11px] font-medium">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            RBAC Enforced
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
            v{APP_CONFIG.version}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          OpenFlow 1.3 / Ryu • Hybrid XAI
        </p>
      </div>
    </aside>
  );
};
