import { useState, useEffect } from 'react';
import { authService, User, UserRole } from '../services/auth';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    // If not authenticated, ensure state is synced
    const syncUser = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  const login = async (username: string, password: string) => {
    const user = await authService.login(username, password);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    const updated = authService.switchRole(role);
    setCurrentUser(updated);
  };

  const effectiveRole = currentUser?.role || 'VIEWER';

  return {
    user: currentUser || {
      id: 'USR-GUEST',
      username: 'guest',
      email: 'guest@sentinel-x.lan',
      role: 'VIEWER' as UserRole,
      fullName: 'Unauthenticated Guest',
    },
    isAuthenticated: authService.isAuthenticated(),
    login,
    logout,
    switchRole,
    canMitigate: authService.canMitigate(effectiveRole),
    canInvestigate: authService.canInvestigate(effectiveRole),
    canRunAdversarial: authService.canRunAdversarial(effectiveRole),
  };
}
