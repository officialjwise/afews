import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AppRole, UserProfile, hasPermission, PermissionKey } from "@/lib/roles";

interface AuthContextValue {
  user: UserProfile | null;
  role: AppRole;
  isAuthenticated: boolean;
  /** Check if current user has a specific permission */
  can: (permission: PermissionKey) => boolean;
  /** Switch role (demo/dev mode — will be replaced by real auth) */
  switchRole: (role: AppRole) => void;
  /** Simulate login (will be replaced by real auth) */
  login: (profile: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo user profiles for development
const DEMO_USERS: Record<AppRole, UserProfile> = {
  admin: {
    id: "demo-admin",
    email: "admin@afews.org",
    displayName: "Adaeze Okonkwo",
    role: "admin",
  },
  stakeholder: {
    id: "demo-stakeholder",
    email: "stakeholder@nema.gov.ng",
    displayName: "Dr. Ibrahim Musa",
    role: "stakeholder",
  },
  coordinator: {
    id: "demo-coordinator",
    email: "coordinator@afews.org",
    displayName: "Chidi Nwosu",
    role: "coordinator",
    assignedAreas: ["Makoko", "Ajegunle"],
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
        isAuthenticated: true, // Always true in demo mode
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
