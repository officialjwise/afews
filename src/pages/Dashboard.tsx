import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import {
  AlertTriangle,
  MapPin,
  Grid3X3,
  Users,
  Bell,
  TrendingUp,
  Clock,
  Droplets,
} from "lucide-react";

const recentAlerts = [
  { id: 1, area: "Makoko", severity: "critical" as const, time: "12 min ago", status: "dispatched" },
  { id: 2, area: "Lekki Phase 1", severity: "high" as const, time: "1h ago", status: "pending review" },
  { id: 3, area: "Victoria Island", severity: "moderate" as const, time: "3h ago", status: "draft" },
  { id: 4, area: "Surulere", severity: "low" as const, time: "6h ago", status: "dispatched" },
];

const riskAreas = [
  { name: "Makoko", risk: 0.92, tiles: 48, subscribers: 1240 },
  { name: "Ajegunle", risk: 0.87, tiles: 36, subscribers: 890 },
  { name: "Lekki Phase 1", risk: 0.74, tiles: 52, subscribers: 2100 },
  { name: "Ikoyi", risk: 0.61, tiles: 44, subscribers: 1560 },
  { name: "Surulere", risk: 0.45, tiles: 40, subscribers: 720 },
];

function riskColor(risk: number) {
  if (risk >= 0.8) return "text-severity-critical";
  if (risk >= 0.6) return "text-severity-high";
  if (risk >= 0.4) return "text-severity-moderate";
  return "text-severity-low";
}

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          System overview and active flood risk monitoring
        </p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Alerts"
          value={7}
          icon={Bell}
          trend={{ value: "2 from yesterday", positive: false }}
        />
        <MetricCard
          label="Monitored Areas"
          value={34}
          icon={MapPin}
        />
        <MetricCard
          label="Active Tiles"
          value="1,248"
          icon={Grid3X3}
        />
        <MetricCard
          label="Subscribers"
          value="8,420"
          icon={Users}
          trend={{ value: "12% this week", positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="lg:col-span-2 panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-header">Recent Alerts</h2>
            <button className="text-xs font-medium text-primary hover:underline">View all</button>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_100px_100px_100px] gap-2 px-3 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Area</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Severity</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Time</span>
            </div>
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="grid grid-cols-[1fr_100px_100px_100px] gap-2 items-center px-3 py-2.5 rounded-sm hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{alert.area}</span>
                </div>
                <Badge variant={alert.severity}>{alert.severity}</Badge>
                <span className="text-xs text-muted-foreground capitalize">{alert.status}</span>
                <span className="text-xs text-muted-foreground text-right">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk overview */}
        <div className="panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-header">Top Risk Areas</h2>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {riskAreas.map((area) => (
              <div key={area.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{area.name}</span>
                  <span className={`text-sm font-semibold font-mono ${riskColor(area.risk)}`}>
                    {(area.risk * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      area.risk >= 0.8
                        ? "bg-severity-critical"
                        : area.risk >= 0.6
                        ? "bg-severity-high"
                        : area.risk >= 0.4
                        ? "bg-severity-moderate"
                        : "bg-severity-low"
                    }`}
                    style={{ width: `${area.risk * 100}%` }}
                  />
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>{area.tiles} tiles</span>
                  <span>{area.subscribers.toLocaleString()} subscribers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System status bar */}
      <div className="panel flex flex-wrap items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Last data sync:</span>
          <span className="font-medium">4 min ago</span>
        </div>
        <StatusIndicator status="active" label="Risk Engine Online" />
        <StatusIndicator status="active" label="Alert Dispatch Active" />
        <StatusIndicator status="pending" label="ML Pipeline Training" />
      </div>
    </div>
  );
}
