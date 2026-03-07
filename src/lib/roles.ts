import { LucideIcon } from "lucide-react";

export type AppRole = "admin" | "stakeholder" | "coordinator";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: AppRole;
  assignedAreas?: string[]; // Coordinators get specific areas
}

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: AppRole[]; // Which roles can see this nav item
}

/**
 * Permission keys used throughout the app.
 * Maps actions to which roles can perform them.
 */
export const PERMISSIONS = {
  // Areas & Tiles
  "areas.manage": ["admin"] as AppRole[],
  "areas.view": ["admin", "stakeholder", "coordinator"] as AppRole[],
  "tiles.generate": ["admin"] as AppRole[],

  // Risk
  "risk.view": ["admin", "stakeholder", "coordinator"] as AppRole[],
  "risk.configure": ["admin"] as AppRole[],

  // Alerts
  "alerts.draft": ["admin", "coordinator"] as AppRole[],
  "alerts.review": ["admin", "stakeholder"] as AppRole[],
  "alerts.approve": ["stakeholder"] as AppRole[],
  "alerts.reject": ["stakeholder"] as AppRole[],
  "alerts.dispatch": ["admin"] as AppRole[],
  "alerts.view_own": ["coordinator"] as AppRole[],
  "alerts.view_all": ["admin", "stakeholder"] as AppRole[],

  // Data & Ingestion
  "ingestion.manage": ["admin"] as AppRole[],
  "ingestion.monitor": ["admin"] as AppRole[],

  // Users & Roles
  "users.manage": ["admin"] as AppRole[],

  // Settings
  "settings.manage": ["admin"] as AppRole[],
  "settings.sms_config": ["admin"] as AppRole[],

  // Reports & Field
  "reports.submit": ["coordinator"] as AppRole[],
  "reports.review": ["admin", "stakeholder"] as AppRole[],

  // Audit
  "audit.view": ["admin"] as AppRole[],

  // Dashboard
  "dashboard.full": ["admin", "stakeholder"] as AppRole[],
  "dashboard.local": ["coordinator"] as AppRole[],
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export function hasPermission(role: AppRole, permission: PermissionKey): boolean {
  return PERMISSIONS[permission].includes(role);
}

export function filterByRole<T extends { roles: AppRole[] }>(items: T[], role: AppRole): T[] {
  return items.filter((item) => item.roles.includes(role));
}

/** Role display metadata */
export const ROLE_META: Record<AppRole, { label: string; description: string; color: string }> = {
  admin: {
    label: "Admin",
    description: "Full system access, alert dispatch, user management",
    color: "bg-primary text-primary-foreground",
  },
  stakeholder: {
    label: "Stakeholder",
    description: "Alert review & approval, dashboards, analytics",
    color: "bg-severity-info text-primary-foreground",
  },
  coordinator: {
    label: "Coordinator",
    description: "Field operations, draft alerts, local reporting",
    color: "bg-accent text-accent-foreground",
  },
};
