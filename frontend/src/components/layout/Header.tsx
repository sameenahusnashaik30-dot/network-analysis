import React, { useState } from 'react';
import { Shield, RefreshCw, UserCheck, AlertTriangle, Search, Radio } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../services/auth';

interface HeaderProps {
  onRefresh?: () => void;
  isDemo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isDemo = true }) => {
  const { user, switchRole } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const roles: UserRole[] = ['ADMIN', 'ANALYST', 'RESEARCHER', 'VIEWER'];

  return (
    <header className="h-16 bg-soc-panel/90 backdrop-blur border-b border-soc-border fixed top-0 left-64 right-0 z-20 px-6 flex items-center justify-between">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-wide">SENTINEL-X</h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-soc-purple/20 text-soc-purple border border-soc-purple/30">
              Hybrid XAI + SDN
            </span>
            {isDemo && (
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                DEMO DATA ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-soc-muted hidden md:block">
            Trustworthy Open-World Zero-Day Attack Detection in Software-Defined Networks
          </p>
        </div>
      </div>

      {/* Action and User Area */}
      <div className="flex items-center gap-3">
        {/* Quick Global Search */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-4 h-4 text-soc-dim absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search flows, IPs, alerts..."
            className="w-full bg-soc-bg border border-soc-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-soc-text placeholder-soc-dim focus:outline-none focus:border-soc-cyan transition"
          />
        </div>

        {/* Refresh Action */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Fetch latest telemetry"
          className="p-2 rounded-lg bg-soc-panelLight border border-soc-border text-soc-muted hover:text-soc-cyan hover:border-soc-cyan/40 transition flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-soc-cyan' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* System Online Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-3.5" />
          <span>System Online</span>
        </div>

        {/* User & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-soc-panelLight border border-soc-border hover:border-soc-borderLight transition text-xs"
          >
            <div className="w-6 h-6 rounded-md bg-soc-cyan/20 border border-soc-cyan/30 flex items-center justify-center text-soc-cyan">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white leading-tight">{user.username}</div>
              <div className="text-[10px] text-soc-cyan font-mono">{user.role}</div>
            </div>
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-soc-panel border border-soc-border rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-soc-border text-[11px] text-soc-dim font-mono uppercase">
                Switch Role (RBAC Simulation)
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-soc-panelLight transition ${
                    user.role === r ? 'text-soc-cyan font-semibold bg-soc-cyan/10' : 'text-soc-text'
                  }`}
                >
                  <span>{r}</span>
                  {user.role === r && <UserCheck className="w-3.5 h-3.5 text-soc-cyan" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
