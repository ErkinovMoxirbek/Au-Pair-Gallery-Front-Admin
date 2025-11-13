import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken, getUser } from '../utils/tokenManager';

export default function ProtectedRoute() {
  const token = getAccessToken();
  const user = getUser();

  const hasSheff =
    Array.isArray(user?.roles)
      ? user.roles.includes('ADMIN')
      : (user?.role === 'ADMIN' || user?.role?.includes?.('ADMIN'));

  return (token && hasSheff) ? <Outlet /> : <Navigate to="/" replace />;
}
