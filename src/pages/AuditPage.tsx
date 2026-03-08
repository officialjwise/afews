import { useState } from "react";
import { ScrollText, User, Clock } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";

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
  { id: "au9", action: "Alert drafted", actor: "Kofi Boateng", role: "coordinator", target: "Flash flood — Alajo", timestamp: "3h ago", category: "alert" },
  { id: "au10", action: "Area boundary updated", actor: "Adaeze Okonkwo", role: "admin", target: "Nima polygon revised", timestamp: "4h ago", category: "area" },
  { id: "au11", action: "User invited", actor: "Adaeze Okonkwo", role: "admin", target: "emeka@nema.gov.ng", timestamp: "5h ago", category: "user" },
  { id: "au12", action: "Subscription cancelled", actor: "Public", role: "public", target: "+234 701***6789 → Surulere", timestamp: "6h ago", category: "subscription" },
  { id: "au13", action: "Risk threshold updated", actor: "Adaeze Okonkwo", role: "admin", target: "Severe min → 0.80", timestamp: "8h ago", category: "system" },
  { id: "au14", action: "Alert sent", actor: "System", role: "system", target: "Moderate advisory — Adabraka (2,100 recipients)", timestamp: "1d ago", category: "alert" },
  { id: "au15", action: "DEM data ingested", actor: "System", role: "system", target: "Copernicus DEM — 50 tiles updated", timestamp: "2d ago", category: "system" },
  { id: "au16", action: "User deactivated", actor: "Adaeze Okonkwo", role: "admin", target: "Amina Bello", timestamp: "3d ago", category: "user" },
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = categoryFilter === "all" ? MOCK : MOCK.filter((e) => e.category === categoryFilter);

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
        emptyIcon={<ScrollText className="h-8 w-8 opacity-50" />}
        emptyMessage="No audit entries found"
      />
    </div>
  );
}
