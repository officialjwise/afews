import { PERMISSIONS, ROLE_META, AppRole, PermissionKey } from "@/lib/roles";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const roles: AppRole[] = ["admin", "stakeholder", "coordinator"];

// Group permissions by category
const permissionGroups: { label: string; keys: PermissionKey[] }[] = [
  { label: "Areas & Tiles", keys: ["areas.manage", "areas.view", "tiles.generate"] },
  { label: "Risk", keys: ["risk.view", "risk.configure"] },
  { label: "Alerts", keys: ["alerts.draft", "alerts.review", "alerts.approve", "alerts.reject", "alerts.dispatch", "alerts.view_own", "alerts.view_all"] },
  { label: "Data & Ingestion", keys: ["ingestion.manage", "ingestion.monitor"] },
  { label: "Users & Settings", keys: ["users.manage", "settings.manage", "settings.sms_config"] },
  { label: "Reports & Audit", keys: ["reports.submit", "reports.review", "audit.view"] },
  { label: "Dashboard", keys: ["dashboard.full", "dashboard.local"] },
];

export default function RolesPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Roles & Permissions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Permission matrix for all system roles</p>
      </div>

      {/* Role descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {roles.map((r) => {
          const meta = ROLE_META[r];
          return (
            <div key={r} className="panel space-y-2">
              <span className={cn("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold", meta.color)}>
                {meta.label}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{meta.description}</p>
            </div>
          );
        })}
      </div>

      {/* Permission matrix */}
      <div className="panel p-0 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-1/2">Permission</th>
              {roles.map((r) => (
                <th key={r} className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground w-1/6">
                  {ROLE_META[r].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionGroups.map((group) => (
              <>
                <tr key={group.label}>
                  <td colSpan={4} className="px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground">
                    {group.label}
                  </td>
                </tr>
                {group.keys.map((key) => (
                  <tr key={key} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-2 text-xs font-mono">{key}</td>
                    {roles.map((r) => {
                      const has = PERMISSIONS[key].includes(r);
                      return (
                        <td key={r} className="text-center px-4 py-2">
                          {has ? (
                            <CheckCircle2 className="h-4 w-4 mx-auto text-status-active" />
                          ) : (
                            <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
