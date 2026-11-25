import { useState } from 'react';
import { authService, User, UserRole } from '../services/auth';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User>(() => authService.getCurrentUser());

  const switchRole = (role: UserRole) => {
    const updated = authService.switchRole(role);
    setCurrentUser(updated);
  };

  return {
    user: currentUser,
    switchRole,
    canMitigate: authService.canMitigate(currentUser.role),
    canInvestigate: authService.canInvestigate(currentUser.role),
    canRunAdversarial: authService.canRunAdversarial(currentUser.role),
  };
}
