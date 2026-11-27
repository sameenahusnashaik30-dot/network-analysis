import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DEMO_CREDENTIALS, UserRole } from '../services/auth';
import {
  Shield,
  Lock,
  User as UserIcon,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Server,
  Cpu,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (cred: typeof DEMO_CREDENTIALS[0]) => {
    setUsername(cred.username);
    setPassword(cred.password);
    try {
      setLoading(true);
      setError(null);
      await login(cred.username, cred.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header Branding */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            SENTINEL-X
          </h2>
        </div>
        <p className="text-center text-xs text-slate-500 font-medium">
          Trustworthy Open-World Zero-Day Attack Detection in Software-Defined Networks
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Enterprise SOC Authentication
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Role-Based Access Control (RBAC) & OpenFlow Security Gateway
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <strong className="block font-semibold">Authentication Error</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Operator Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or analyst"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Access Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                'Verifying Credentials...'
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Authenticate Session
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Access Role Selector */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Pre-Configured RBAC Evaluation Profiles:
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Click to Auto-Sign In
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => handleQuickLogin(cred)}
                  disabled={loading}
                  className="text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 bg-slate-50/60 transition group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 group-hover:text-blue-700">
                      {cred.label}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      cred.role === 'ADMIN'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : cred.role === 'ANALYST'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : cred.role === 'RESEARCHER'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {cred.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {cred.description}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                    User: <strong className="text-slate-600">{cred.username}</strong> • Password: <strong className="text-slate-600">{cred.password}</strong>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400">
              Session is encrypted using standard JSON Web Tokens (JWT) with HMAC-SHA256 authorization.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
