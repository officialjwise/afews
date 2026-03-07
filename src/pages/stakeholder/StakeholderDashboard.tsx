import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  MapPin,
  Activity,
  Bell,
  Droplets,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const pendingAlerts = [
  { id: "al1", title: "Severe flooding expected in Makoko", area: "Makoko", riskLevel: "severe", createdBy: "Chidi Nwosu", createdAt: "2h ago" },
  { id: "al2", title: "High flood risk warning for Ajegunle", area: "Ajegunle", riskLevel: "high", createdBy: "Adaeze Okonkwo", createdAt: "4h ago" },
];

const hotspots = [
  { name: "Makoko", risk: 0.94, riskLevel: "severe" },
  { name: "Ajegunle", risk: 0.87, riskLevel: "severe" },
  { name: "Lekki Phase 1", risk: 0.74, riskLevel: "high" },
];

const riskBadge: Record<string, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

function riskColor(risk: number) {
  if (risk >= 0.8) return "text-severity-critical";
  if (risk >= 0.6) return "text-severity-high";
  if (risk >= 0.4) return "text-severity-moderate";
  return "text-severity-low";
}

export default function StakeholderDashboard() {
  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Stakeholder Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Operational overview and alert review
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard label="Pending Reviews" value={pendingAlerts.length} icon={Bell} trend={{ value: "1 new today", positive: false }} />
        <MetricCard label="Active Hotspots" value={3} icon={AlertTriangle} />
        <MetricCard label="Total Areas" value={34} icon={MapPin} />
        <MetricCard label="Active Subscriptions" value="8,420" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending reviews */}
        <div className="panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-header">Alerts Pending Review</h2>
            <Link to="/stakeholder/alerts" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {pendingAlerts.map((alert) => (
              <Link
                key={alert.id}
                to={`/stakeholder/alerts/${alert.id}`}
                className="block rounded-sm border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{alert.title}</span>
                  <Badge variant={riskBadge[alert.riskLevel]}>{alert.riskLevel}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {alert.area}
                  <span>·</span>
                  <span>by {alert.createdBy}</span>
                  <span>·</span>
                  <Clock className="h-3 w-3" /> {alert.createdAt}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Hotspots */}
        <div className="panel space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="section-header">Top Hotspots</h2>
            <HelpTooltip text="Risk is computed per tile and then aggregated to give each area an overall score." />
          </div>
          <div className="space-y-2">
            {hotspots.map((area) => (
              <Link
                key={area.name}
                to="/stakeholder/hotspots"
                className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{area.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={riskBadge[area.riskLevel]}>{area.riskLevel}</Badge>
                  <span className={`font-mono text-sm font-semibold ${riskColor(area.risk)}`}>
                    {(area.risk * 100).toFixed(0)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="panel flex flex-wrap items-center gap-6 text-xs">
        <StatusIndicator status="active" label="Risk Engine Online" />
        <StatusIndicator status="active" label="Alert Dispatch Active" />
      </div>
    </div>
  );
}
