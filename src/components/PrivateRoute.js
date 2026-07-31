import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken, getUser } from "../utils/tokenManager";
import { hasAllowedRole } from "../utils/roleUtils";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const token = getAccessToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  const hasAccess = hasAllowedRole(user, allowedRoles);

  if (!hasAccess) {
    return <Navigate to="/dashboard/users" replace />;
  }

  return <Outlet />;
}