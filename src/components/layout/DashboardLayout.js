import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const normalizeRoles = (user) => {
  let roles = [];

  if (Array.isArray(user?.roles)) {
    roles = user.roles;
  } else if (typeof user?.role === "string" && user.role.trim()) {
    roles = [user.role];
  }

  return roles
    .filter(Boolean)
    .map((role) => role.replace("ROLE_", "").toUpperCase());
};

export default function DashboardLayout() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roles = normalizeRoles(user);

  const isAdmin = roles.includes("ADMIN");
  const isManager = roles.includes("MANAGER");

  const dashboardTitle = isAdmin
    ? "Adminbereich"
    : isManager
    ? "Managerbereich"
    : "Dashboard";

  const roleLabel = isAdmin
    ? "Admin"
    : isManager
    ? "Manager"
    : "Benutzer";

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {dashboardTitle}
            </h1>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Angemeldet als:
              </span>

              <span className="text-sm text-gray-800 font-medium">
                {user.name || user.email || 'Unbekannter Benutzer'}
              </span>

              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                {roleLabel}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}