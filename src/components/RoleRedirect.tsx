import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  stakeholder: "/stakeholder",
  coordinator: "/coordinator",
};

interface RoleRedirectProps {
  fallback?: string;
}

/**
 * Redirects to the appropriate role-specific home page.
 */
export function RoleRedirect({ fallback }: RoleRedirectProps) {
  const { role } = useAuth();
  const target = fallback
    ? fallback.replace(/^\/(admin|stakeholder|coordinator)/, `/${role}`)
    : ROLE_HOME[role] || "/admin";
  return <Navigate to={target} replace />;
}
