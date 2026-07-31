import { useAuth } from "../../hooks/useAuth";
import OverviewAdmin from "./OverviewAdmin";
import OverviewManager from "./OverviewManager";

const normalizeRoles = (user) => {
  if (Array.isArray(user?.roles)) return user.roles;

  if (typeof user?.role === "string" && user.role.trim()) return [user.role];

  return [];
};

const hasRole = (roles, key) =>
  roles.some((r) => typeof r === "string" && r.toUpperCase().includes(key));

export default function Overview() {
  const { user } = useAuth();

  const roles = normalizeRoles(user);

  const isAdmin = hasRole(roles, "ADMIN") || roles.includes("ROLE_ADMIN");
  const isManager = hasRole(roles, "MANAGER") || roles.includes("ROLE_MANAGER");

  if (isAdmin) return <OverviewAdmin />;
  if (isManager) return <OverviewManager />;

  return (
    <div className="p-8 text-center text-gray-600">
      403 - Keine Berechtigung
    </div>
  );
}
