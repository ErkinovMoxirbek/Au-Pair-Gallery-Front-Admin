import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getUser } from "../../utils/tokenManager";

export default function RoleRedirector() {
  const { loading } = useAuth();
  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    const roles = user.roles || [];

    // Admin/Sheff block
    if (roles.some((r) => ["ROLE_ADMIN", "ADMIN", "ROLE_SHEFF", "SHEFF"].includes(r))) {
      navigate("/", { replace: true });
      return;
    }

    if (roles.includes("FAMILY") || roles.includes("ROLE_FAMILY")) {
      navigate("/family", { replace: true });
      return;
    }

    if (roles.includes("AUPAIR") || roles.includes("ROLE_AUPAIR")) {
      navigate("/candidate", { replace: true });
      return;
    }

    // Role yo‘q bo‘lsa ham fallback
    navigate("/candidate", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="ml-3 text-gray-600">Yo‘naltirilmoqda...</p>
    </div>
  );
}
