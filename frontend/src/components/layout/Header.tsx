import React, { useState } from 'react';
import { Shield, RefreshCw, AlertTriangle, Search, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../services/auth';

interface HeaderProps {
  onRefresh?: () => void;
  isDemo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isDemo = false }) => {
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
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 left-64 right-0 z-20 px-6 flex items-center justify-between shadow-sm">
      {/* Product Title & Subtitle */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">SENTINEL-X</h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              SDN NIDS / NIPS
            </span>
            {isDemo && (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                SIMULATION MODE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 hidden md:block">
            Trustworthy Open-World Zero-Day Attack Detection in Software-Defined Networks
          </p>
        </div>
      </div>

      {/* Global Status, Search, and User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search flows, IPs, alerts..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Refresh Action */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Fetch latest network telemetry"
          className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-1.5 text-xs font-medium shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Subtle Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">System Operational</span>
        </div>

        {/* User / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 transition text-xs shadow-sm"
          >
            <div className="w-6 h-6 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-900 leading-tight">{user.username}</div>
              <div className="text-[10px] text-blue-600 font-medium">{user.role}</div>
            </div>
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
              <div className="px-3 py-1 border-b border-slate-100 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Switch Role (RBAC Simulation)
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                    user.role === r ? 'font-semibold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  {user.role === r && <CheckCircle className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
