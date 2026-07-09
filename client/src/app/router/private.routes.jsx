import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/auth.provider.jsx';

const PrivateRoute = ({ requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // 🔥 CRITICAL FIX
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // role safe access
  const userRole = user?.role;

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;