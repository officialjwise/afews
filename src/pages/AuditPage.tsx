import { useState, useEffect } from "react";
import { ScrollText, User, Clock, Loader2 } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { auditApi, type AuditEntry as ApiAuditEntry } from "@/lib/api";
import { toast } from "sonner";

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  role: string;
  target: string;
  timestamp: string;
  category: string;
}

function deriveCategory(resourceType?: string | null): string {
  const t = (resourceType ?? "").toLowerCase();
  if (t.includes("alert")) return "alert";
  if (t.includes("area")) return "area";
  if (t.includes("user")) return "user";
  if (t.includes("sub")) return "subscription";
  return "system";
}

function adaptAudit(r: ApiAuditEntry): AuditEntry {
  // Prefer the enriched resource_name if available, otherwise fall back to resource_type only
  const targetLabel = r.resource_name
    ? `${r.resource_type}: ${r.resource_name}`
    : r.resource_type
      ? r.resource_type
      : "—";
  return {
    id: r.id,
    action: r.action,
    actor: r.user_name ?? "System",
    role: r.user_role?.toLowerCase() ?? "system",
    target: targetLabel,
    timestamp: new Date(r.created_at).toLocaleString(),
    category: deriveCategory(r.resource_type),
  };
}

const catColor: Record<string, string> = {
  alert: "bg-severity-high/15 text-severity-high",
  area: "bg-severity-info/15 text-severity-info",
  user: "bg-accent/15 text-accent",
  system: "bg-muted text-muted-foreground",
  subscription: "bg-status-active/15 text-status-active",
};

const CATEGORIES = ["all", "alert", "area", "user", "system", "subscription"] as const;

const columns: Column<AuditEntry>[] = [
  {
    key: "action",
    header: "Action",
    render: (r) => <span className="text-sm font-medium">{r.action}</span>,
  },
  {
    key: "actor",
    header: "Actor",
    render: (r) => (
      <div className="flex items-center gap-1.5 text-xs">
        <User className="h-3 w-3 text-muted-foreground" />
        <span>{r.actor}</span>
        <span className="text-muted-foreground">({r.role})</span>
      </div>
    ),
  },
  {
    key: "target",
    header: "Target",
    render: (r) => <span className="text-xs text-muted-foreground">{r.target}</span>,
  },
  {
    key: "category",
    header: "Category",
    render: (r) => (
      <span className={`inline-flex rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${catColor[r.category]}`}>
        {r.category}
      </span>
    ),
  },
  {
    key: "timestamp",
    header: "Time",
    render: (r) => (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3" /> {r.timestamp}
      </span>
    ),
  },
];

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    auditApi.list({ page_size: "100" })
      .then((res) => {
        if (!cancelled) setEntries((res.data?.items ?? []).map(adaptAudit));
      })
      .catch(() => toast.error("Failed to load audit log."))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = categoryFilter === "all" ? entries : entries.filter((e) => e.category === categoryFilter);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System activity and change history</p>
      </div>

      <div className="flex items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors border ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        pageSize={8}
        searchable
        searchKeys={["action", "actor", "target"] as any}
        emptyIcon={loading ? <Loader2 className="h-8 w-8 opacity-50 animate-spin" /> : <ScrollText className="h-8 w-8 opacity-50" />}
        emptyMessage={loading ? "Loading audit log..." : "No audit entries found"}
      />
    </div>
  );
}
