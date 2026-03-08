import { useState } from "react";
import { ScrollText, User, Clock } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  role: string;
  target: string;
  timestamp: string;
  category: "alert" | "area" | "user" | "system" | "subscription";
}

const MOCK: AuditEntry[] = [
  { id: "au1", action: "Alert dispatched", actor: "Adaeze Okonkwo", role: "admin", target: "Severe flooding — Makoko", timestamp: "12 min ago", category: "alert" },
  { id: "au2", action: "Alert approved", actor: "Dr. Ibrahim Musa", role: "stakeholder", target: "High risk — Ajegunle", timestamp: "1h ago", category: "alert" },
  { id: "au3", action: "Area imported", actor: "Adaeze Okonkwo", role: "admin", target: "Victoria Island (manual)", timestamp: "3h ago", category: "area" },
  { id: "au4", action: "User role updated", actor: "Adaeze Okonkwo", role: "admin", target: "Amina Bello → coordinator", timestamp: "1d ago", category: "user" },
  { id: "au5", action: "Risk computed", actor: "System", role: "system", target: "All areas — 7 areas processed", timestamp: "18 min ago", category: "system" },
  { id: "au6", action: "Alert rejected", actor: "Dr. Ibrahim Musa", role: "stakeholder", target: "Flash flood alert — VI", timestamp: "2d ago", category: "alert" },
  { id: "au7", action: "Subscription created", actor: "Public", role: "public", target: "+234 801***4567 → Makoko, Ajegunle", timestamp: "5h ago", category: "subscription" },
  { id: "au8", action: "Ingestion triggered", actor: "Adaeze Okonkwo", role: "admin", target: "Open-Meteo pipeline", timestamp: "42 min ago", category: "system" },
];

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
  const isLoading = useSimulatedLoading(1000);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = categoryFilter === "all" ? MOCK : MOCK.filter((e) => e.category === categoryFilter);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System activity and change history</p>
      </div>

      {isLoading ? <TableSkeleton rows={6} columns={5} /> : (
        <>
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
            searchable
            searchKeys={["action", "actor", "target"] as any}
            emptyIcon={<ScrollText className="h-8 w-8 opacity-50" />}
            emptyMessage="No audit entries found"
          />
        </>
      )}
    </div>
  );
}
