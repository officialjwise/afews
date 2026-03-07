import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  MapPin,
  Bell,
  Droplets,
  Activity,
} from "lucide-react";

const assignedAreas = [
  { name: "Makoko", risk: 0.92, riskLevel: "severe" as const, activeAlerts: 1 },
  { name: "Ajegunle", risk: 0.87, riskLevel: "high" as const, activeAlerts: 0 },
];

const myAlerts = [
  { id: "al2", title: "High flood risk warning for Ajegunle", area: "Ajegunle", status: "draft", createdAt: "4h ago" },
  { id: "al5", title: "Low-level monitoring — Surulere", area: "Surulere", status: "draft", createdAt: "3h ago" },
];

function riskColor(risk: number) {
  if (risk >= 0.8) return "text-severity-critical";
  if (risk >= 0.6) return "text-severity-high";
  if (risk >= 0.4) return "text-severity-moderate";
  return "text-severity-low";
}

const riskBadge: Record<string, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

export default function CoordinatorDashboard() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Coordinator Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your assigned areas and active tasks
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Assigned Areas" value={assignedAreas.length} icon={MapPin} />
        <MetricCard label="My Draft Alerts" value={myAlerts.length} icon={Bell} />
        <MetricCard label="Pending Reports" value={1} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned areas */}
        <div className="panel space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="section-header">Assigned Areas</h2>
            <HelpTooltip text="Areas are neighbourhood boundaries used to group risk and target alerts. You're assigned specific areas to monitor." />
          </div>
          <div className="space-y-2">
            {assignedAreas.map((area) => (
              <Link
                key={area.name}
                to={`/coordinator/areas`}
                className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{area.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {area.activeAlerts > 0 && (
                    <span className="flex items-center gap-1 text-xs text-severity-critical">
                      <AlertTriangle className="h-3 w-3" /> {area.activeAlerts} alert
                    </span>
                  )}
                  <Badge variant={riskBadge[area.riskLevel]}>{area.riskLevel}</Badge>
                  <span className={`font-mono text-sm font-semibold ${riskColor(area.risk)}`}>
                    {(area.risk * 100).toFixed(0)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* My alerts */}
        <div className="panel space-y-4">
          <h2 className="section-header">My Alerts</h2>
          <div className="space-y-2">
            {myAlerts.map((alert) => (
              <Link
                key={alert.id}
                to={`/coordinator/alerts/${alert.id}`}
                className="block rounded-sm border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm font-medium">{alert.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {alert.area}
                  <span>·</span>
                  <span className="bg-muted px-1.5 py-0.5 rounded-sm text-[10px] font-medium">{alert.status}</span>
                  <span>·</span>
                  <span>{alert.createdAt}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/coordinator/alerts/new" className="text-xs text-primary hover:underline">
            + Draft new alert
          </Link>
        </div>
      </div>

      <div className="panel flex flex-wrap items-center gap-6 text-xs">
        <StatusIndicator status="active" label="Risk Engine Online" />
        <StatusIndicator status="active" label="Alert System Active" />
      </div>
    </div>
  );
}
