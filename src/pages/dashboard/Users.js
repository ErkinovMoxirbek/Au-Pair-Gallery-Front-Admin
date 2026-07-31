import { useAuth } from "../../hooks/useAuth";
import UsersAdmin from "./UsersAdmin";
import UsersManager from "./UsersManager";

const normalizeRoles = (user) => {
  if (Array.isArray(user?.roles)) return user.roles;

  if (typeof user?.role === "string" && user.role.trim()) return [user.role];

  // 3) fallback
  return [];
};

const hasRole = (roles, key) =>
  roles.some((r) => typeof r === "string" && r.toUpperCase().includes(key));

export default function Users() {
  

  const { user } = useAuth();
  const roles = normalizeRoles(user);




  const isAdmin = hasRole(roles, "ADMIN") || roles.includes("ROLE_ADMIN");
  const isManager = hasRole(roles, "MANAGER") || roles.includes("ROLE_MANAGER");

  console.log("User Roles:", roles);
  if (isAdmin) return <UsersAdmin />;
  if (isManager) return <UsersAdmin />;

  return (
    <div className="p-8 text-center text-gray-600">
      403 - Keine Berechtigung
    </div>
  );
}
