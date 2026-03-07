import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppRole } from "@/lib/roles";
import { ShieldX } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles allowed to access this route. If empty, any authenticated user can access. */
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/subscribe" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="p-6 space-y-4 max-w-7xl">
        <div className="panel flex flex-col items-center justify-center py-20 text-center space-y-3">
          <ShieldX className="h-8 w-8 text-severity-critical" />
          <h2 className="text-lg font-semibold">Access Denied</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Your role ({role}) does not have permission to access this page.
            Contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
