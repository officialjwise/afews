import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AppRole, UserProfile, hasPermission, PermissionKey } from "@/lib/roles";

interface AuthContextValue {
  user: UserProfile | null;
  role: AppRole;
  isAuthenticated: boolean;
  can: (permission: PermissionKey) => boolean;
  switchRole: (role: AppRole) => void;
  login: (profile: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo user profiles — Ghana-based
const DEMO_USERS: Record<AppRole, UserProfile> = {
  admin: {
    id: "demo-admin",
    email: "admin@afews.org",
    displayName: "Kwame Asante",
    role: "admin",
  },
  stakeholder: {
    id: "demo-stakeholder",
    email: "stakeholder@nadmo.gov.gh",
    displayName: "Dr. Ama Mensah",
    role: "stakeholder",
  },
  coordinator: {
    id: "demo-coordinator",
    email: "coordinator@afews.org",
    displayName: "Kofi Boateng",
    role: "coordinator",
    assignedAreas: ["Alajo", "Nima"],
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEMO_USERS.admin);

  const can = useCallback(
    (permission: PermissionKey) => hasPermission(user.role, permission),
    [user.role]
  );

  const switchRole = useCallback((role: AppRole) => {
    setUser(DEMO_USERS[role]);
  }, []);

  const login = useCallback((profile: UserProfile) => {
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    setUser(DEMO_USERS.admin);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        isAuthenticated: true,
        can,
        switchRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
