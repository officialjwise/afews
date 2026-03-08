import { useState } from "react";
import { StatusIndicator } from "@/components/StatusIndicator";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { ListSkeleton, MetricsSkeleton } from "@/components/shared/TableSkeleton";
import { Database, Cloud, Activity, MessageSquare, Globe, CheckCircle2, AlertTriangle } from "lucide-react";

interface HealthItem {
  name: string;
  status: "active" | "pending" | "error";
  detail: string;
  endpoint?: string;
  icon: React.ElementType;
}

const HEALTH: HealthItem[] = [
  { name: "Database", status: "active", detail: "PostgreSQL — 4ms latency", endpoint: "GET /v1/health/db", icon: Database },
  { name: "GCS Bucket", status: "active", detail: "afews-data-bucket — accessible", endpoint: "GET /v1/health/gcs", icon: Cloud },
  { name: "Ingestion Pipeline", status: "active", detail: "Last run: 42 min ago — 3 sources synced", icon: Activity },
  { name: "Risk Compute", status: "active", detail: "Last computed: 18 min ago — all areas", icon: Activity },
  { name: "Feature Generation", status: "pending", detail: "Last run slow: 12 min (threshold: 5 min)", icon: Activity },
  { name: "SMS Provider (Twilio)", status: "active", detail: "99.8% uptime — 1,240 sent today", icon: MessageSquare },
  { name: "WhatsApp Provider", status: "pending", detail: "Meta Business API — rate limit approaching", icon: MessageSquare },
  { name: "Nominatim API", status: "active", detail: "https://nominatim.openstreetmap.org — 120ms", icon: Globe },
  { name: "Overpass API", status: "active", detail: "https://overpass-api.de — 340ms", icon: Globe },
  { name: "Open-Meteo", status: "active", detail: "https://api.open-meteo.com — 90ms", icon: Globe },
  { name: "CHIRPS Rainfall", status: "pending", detail: "Delayed sync — last update 12h ago", icon: Globe },
  { name: "NASA GPM", status: "error", detail: "Connection timeout — retrying", icon: Globe },
];

const STATUS_FILTERS = ["all", "active", "pending", "error"] as const;

export default function HealthPage() {
  const isLoading = useSimulatedLoading(1000);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = statusFilter === "all" ? HEALTH : HEALTH.filter((h) => h.status === statusFilter);
  const healthy = HEALTH.filter((h) => h.status === "active").length;
  const warnings = HEALTH.filter((h) => h.status === "pending").length;
  const errors = HEALTH.filter((h) => h.status === "error").length;

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">System Health</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time monitoring of all system components</p>
      </div>

      {isLoading ? (
        <>
          <MetricsSkeleton count={3} />
          <ListSkeleton count={6} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="panel flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-status-active" />
              <div>
                <p className="text-2xl font-bold text-status-active">{healthy}</p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
            </div>
            <div className="panel flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-status-pending" />
              <div>
                <p className="text-2xl font-bold text-status-pending">{warnings}</p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
            </div>
            <div className="panel flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-severity-critical" />
              <div>
                <p className="text-2xl font-bold text-severity-critical">{errors}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors border ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.name} className="panel flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.detail}</p>
                      {h.endpoint && <p className="text-[10px] text-muted-foreground font-mono">{h.endpoint}</p>}
                    </div>
                  </div>
                  <StatusIndicator
                    status={h.status}
                    label={h.status === "active" ? "Healthy" : h.status === "pending" ? "Warning" : "Down"}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
