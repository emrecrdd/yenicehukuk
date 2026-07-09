import { useAuth as useAuthProvider } from '../app/providers/auth.provider.jsx';

export const useAuth = () => {
  const auth = useAuthProvider();

  const hasPermission = (permission) => {
    if (!auth.user) return false;
    // Check if user has specific permission
    // This would depend on your permission system
    return true;
  };

  const hasRole = (role) => {
    if (!auth.user) return false;
    return auth.user.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!auth.user) return false;
    return roles.includes(auth.user.role);
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const isLawyer = () => {
    return hasRole('lawyer');
  };

  const isSecretary = () => {
    return hasRole('secretary');
  };

  const isIntern = () => {
    return hasRole('intern');
  };

  return {
    ...auth,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAdmin,
    isLawyer,
    isSecretary,
    isIntern,
  };
};

export default useAuth;