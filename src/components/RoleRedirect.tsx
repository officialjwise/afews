import { Navigate, useParams } from "react-router-dom";
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
 * Preserves subpaths if used in a wildcard route (e.g. /areas/*).
 */
export function RoleRedirect({ fallback }: RoleRedirectProps) {
  const { role } = useAuth();
  const params = useParams();
  const splat = params["*"];

  let target = fallback
    ? fallback.replace(/^\/(admin|stakeholder|coordinator)/, `/${role}`)
    : ROLE_HOME[role] || "/admin";

  if (splat) {
    // Remove trailing slash from target if present to avoid double slashes
    target = target.replace(/\/$/, "");
    // Append the captured wildcard path
    target = `${target}/${splat}`;
  }

  return <Navigate to={target} replace />;
}