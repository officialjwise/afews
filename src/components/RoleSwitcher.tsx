import { useAuth } from "@/contexts/AuthContext";
import { AppRole, ROLE_META } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const roles: AppRole[] = ["admin", "stakeholder", "coordinator"];

/**
 * Dev-only role switcher. Allows toggling between roles to preview
 * role-based UI changes. Will be removed in production.
 */
export function RoleSwitcher() {
  const { role, switchRole, user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const meta = ROLE_META[role];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-card hover:bg-muted transition-colors text-xs"
      >
        <span className={cn("px-1.5 py-0.5 rounded-sm text-[10px] font-semibold", meta.color)}>
          {meta.label}
        </span>
        <span className="font-medium text-foreground hidden sm:inline">{user?.displayName}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 rounded-md border bg-card shadow-lg z-50">
          <div className="px-3 py-2 border-b">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Switch Role (Dev Mode)
            </p>
          </div>
          {roles.map((r) => {
            const m = ROLE_META[r];
            return (
              <button
                key={r}
                onClick={() => {
                  switchRole(r);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors",
                  r === role && "bg-muted/50"
                )}
              >
                <span className={cn("mt-0.5 px-1.5 py-0.5 rounded-sm text-[10px] font-semibold flex-shrink-0", m.color)}>
                  {m.label}
                </span>
                <div>
                  <p className="text-xs font-medium text-foreground">{ROLE_META[r].label}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{m.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
