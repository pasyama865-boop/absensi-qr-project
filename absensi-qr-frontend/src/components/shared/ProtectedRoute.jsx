import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user && !isLoading) {
      checkAuth();
    }
  }, [user, isLoading, checkAuth]);

  if (isLoading) {
    return <div>Loading...</div>; 
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    const targetPath = user.role === 'admin' ? '/admin' : user.role === 'guru' ? '/guru' : '/siswa';
    if (location.pathname.startsWith(`/${user.role}`)) {
      return <Outlet />; 
    }
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;