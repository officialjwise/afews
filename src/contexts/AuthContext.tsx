import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { AppRole, UserProfile, hasPermission, PermissionKey } from "@/lib/roles";
import { authApi, tokenStore, TokenData } from "@/lib/api";

interface AuthContextValue {
  user: UserProfile | null;
  role: AppRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  can: (permission: PermissionKey) => boolean;
  login: (tokenData: TokenData) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Parse the JWT payload (base64url) without verifying the signature. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function profileFromToken(token: string): UserProfile | null {
  const claims = decodeJwtPayload(token);
  if (!claims) return null;
  const rawRole = typeof claims.role === "string" ? claims.role.toLowerCase() : "coordinator";
  const role = (["admin", "stakeholder", "coordinator"].includes(rawRole) ? rawRole : "coordinator") as AppRole;
  return {
    id: (claims.sub as string) || "",
    email: (claims.email as string) || "",
    displayName: (claims.email as string) || "Staff",
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on first mount
  useEffect(() => {
    const token = tokenStore.getAccess();
    if (token) {
      const claims = decodeJwtPayload(token);
      const exp = claims?.exp as number | undefined;
      if (exp && exp * 1000 > Date.now()) {
        // Token still valid — restore immediately
        setUser(profileFromToken(token));
        setIsLoading(false);
        return;
      }
      // Token expired — attempt silent refresh before giving up
      const refreshToken = tokenStore.getRefresh();
      if (refreshToken) {
        authApi.refreshToken(refreshToken)
          .then((res) => {
            tokenStore.set(res.data.access_token, res.data.refresh_token);
            setUser(profileFromToken(res.data.access_token));
          })
          .catch(() => {
            tokenStore.clear();
          })
          .finally(() => setIsLoading(false));
        return;
      }
      tokenStore.clear();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((tokenData: TokenData) => {
    tokenStore.set(tokenData.access_token, tokenData.refresh_token);
    setUser(profileFromToken(tokenData.access_token));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors — clear local session regardless
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const can = useCallback(
    (permission: PermissionKey) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? "coordinator",
        isAuthenticated: user !== null,
        isLoading,
        can,
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

