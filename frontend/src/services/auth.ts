import axios from 'axios';
import { APP_CONFIG } from '../utils/constants';

export type UserRole = 'ADMIN' | 'ANALYST' | 'RESEARCHER' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
}

const STORAGE_KEY_TOKEN = 'sentinel_x_token';
const STORAGE_KEY_USER = 'sentinel_x_user';

export const DEMO_CREDENTIALS = [
  {
    role: 'ADMIN' as UserRole,
    username: 'admin',
    password: 'AdminPass2026!',
    label: 'Administrator (SecOps)',
    description: 'Full mitigation authorization, switch flow-mod execution, and system configuration.',
  },
  {
    role: 'ANALYST' as UserRole,
    username: 'analyst',
    password: 'AnalystPass2026!',
    label: 'SOC Security Analyst',
    description: 'Triage live network flows, investigate zero-day anomalies, and review XAI attributions.',
  },
  {
    role: 'RESEARCHER' as UserRole,
    username: 'researcher',
    password: 'ResearcherPass2026!',
    label: 'ML / SDN Researcher',
    description: 'Execute adversarial robustness tests, tune perturbation noise, and audit stability.',
  },
  {
    role: 'VIEWER' as UserRole,
    username: 'viewer',
    password: 'ViewerPass2026!',
    label: 'Executive / Observer',
    description: 'Read-only access to security dashboards and compliance reports.',
  },
];

export const authService = {
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const user = localStorage.getItem(STORAGE_KEY_USER);
    return Boolean(token && user);
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return null;
  },

  async login(username: string, password: string): Promise<User> {
    const cleanUsername = username.trim().toLowerCase();
    
    try {
      const res = await axios.post(`${APP_CONFIG.apiBaseUrl}/auth/login`, {
        username: cleanUsername,
        password,
      });

      const { access_token, role } = res.data;
      const user: User = {
        id: `USR-${cleanUsername.toUpperCase()}`,
        username: cleanUsername,
        email: `${cleanUsername}@sentinel-x.lan`,
        role: role as UserRole,
        fullName:
          role === 'ADMIN'
            ? 'Security Administrator'
            : role === 'ANALYST'
            ? 'SOC Security Analyst'
            : role === 'RESEARCHER'
            ? 'ML/SDN Researcher'
            : 'SOC Dashboard Observer',
      };

      this.setCurrentUser(user, access_token);
      return user;
    } catch (err: any) {
      // Offline fallback: check against hardcoded verified accounts
      const matched = DEMO_CREDENTIALS.find(
        (c) => c.username === cleanUsername && c.password === password
      );

      if (matched) {
        const user: User = {
          id: `USR-${matched.username.toUpperCase()}`,
          username: matched.username,
          email: `${matched.username}@sentinel-x.lan`,
          role: matched.role,
          fullName: matched.label,
        };
        this.setCurrentUser(user, `mock-jwt-token-${matched.username}`);
        return user;
      }

      const msg = err.response?.data?.detail || 'Invalid username or password. Please verify credentials.';
      throw new Error(msg);
    }
  },

  setCurrentUser(user: User, token?: string): void {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    }
  },

  switchRole(role: UserRole): User {
    const current = this.getCurrentUser();
    const updated: User = {
      ...(current || {
        id: 'USR-001',
        username: 'operator',
        email: 'operator@sentinel-x.lan',
      }),
      role,
      fullName:
        role === 'ADMIN'
          ? 'Security Administrator'
          : role === 'ANALYST'
          ? 'SOC Security Analyst'
          : role === 'RESEARCHER'
          ? 'ML/SDN Researcher'
          : 'SOC Dashboard Observer',
    };
    this.setCurrentUser(updated);
    return updated;
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  },

  canMitigate(role: UserRole): boolean {
    return role === 'ADMIN';
  },

  canInvestigate(role: UserRole): boolean {
    return role === 'ADMIN' || role === 'ANALYST';
  },

  canRunAdversarial(role: UserRole): boolean {
    return role === 'ADMIN' || role === 'RESEARCHER';
  },
};
