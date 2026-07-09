import { useAuth } from '../app/providers/auth.provider.jsx';
import { PERMISSIONS } from '../constants/roles.js';

export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    if (!user) return false;
    const userPermissions = PERMISSIONS[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return { hasPermission, hasRole, hasAnyRole };
};