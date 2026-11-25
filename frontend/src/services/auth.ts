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

export const authService = {
  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    // Default Admin for prototype
    return {
      id: 'USR-001',
      username: 'admin',
      email: 'secops@sentinel-x.lan',
      role: 'ADMIN',
      fullName: 'Security Administrator',
    };
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
      ...current,
      role,
      fullName:
        role === 'ADMIN'
          ? 'Security Administrator'
          : role === 'ANALYST'
          ? 'SOC Security Analyst'
          : role === 'RESEARCHER'
          ? 'ML/SDN Researcher'
          : 'SOC Dashboard Viewer',
    };
    this.setCurrentUser(updated);
    return updated;
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY_TOKEN) || 'demo-jwt-bearer-token';
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    // Reset to default viewer or prompt login
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
