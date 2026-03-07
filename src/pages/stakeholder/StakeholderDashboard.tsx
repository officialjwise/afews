import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { Link } from "react-router-dom";
import {
  AlertTriangle, MapPin, Activity, Bell, Droplets, Clock, CheckCircle2, BarChart3, TrendingUp,
} from "lucide-react";

const pendingAlerts = [
  { id: "al1", title: "Severe flooding expected in Alajo", area: "Alajo", riskLevel: "severe", createdBy: "Kofi Boateng", createdAt: "2h ago" },
  { id: "al2", title: "High flood risk warning for Nima", area: "Nima", riskLevel: "high", createdBy: "Kwame Asante", createdAt: "4h ago" },
];

const hotspots = [
  { name: "Odawna", risk: 0.91, riskLevel: "severe", trend: "+3%" },
  { name: "Alajo", risk: 0.94, riskLevel: "severe", trend: "+1%" },
  { name: "Nima", risk: 0.87, riskLevel: "severe", trend: "-2%" },
  { name: "Adabraka", risk: 0.74, riskLevel: "high", trend: "+5%" },
  { name: "Osu", risk: 0.61, riskLevel: "high", trend: "0%" },
];

const deliveryStats = { sent: 4200, failed: 23, pending: 89 };

const riskBadge: Record<string, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

function riskColor(risk: number) {
  if (risk >= 0.8) return "text-severity-critical";
  if (risk >= 0.6) return "text-severity-high";
  if (risk >= 0.4) return "text-severity-moderate";
  return "text-severity-low";
}

function riskBg(risk: number) {
  if (risk >= 0.8) return "bg-severity-critical";
  if (risk >= 0.6) return "bg-severity-high";
  if (risk >= 0.4) return "bg-severity-moderate";
  return "bg-severity-low";
}

export default function StakeholderDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Stakeholder Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Operational overview · Greater Accra Region
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Pending Reviews" value={pendingAlerts.length} icon={Bell} trend={{ value: "1 new today", positive: false }} />
        <MetricCard label="Active Hotspots" value={hotspots.filter(h => h.risk >= 0.8).length} icon={AlertTriangle} />
        <MetricCard label="Total Areas" value={34} icon={MapPin} />
        <MetricCard label="Alerts Delivered" value={deliveryStats.sent.toLocaleString()} icon={Activity} trend={{ value: `${deliveryStats.failed} failed`, positive: false }} />
      </div>

      {/* Weather */}
      <WeatherDashboard />

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

        {/* Hotspots — enhanced with trends */}
        <div className="panel space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="section-header">Hotspot Rankings</h2>
            <HelpTooltip text="Risk is computed per tile and then aggregated to give each area an overall score. Rankings update every 6 hours." />
          </div>
          <div className="space-y-3">
            {hotspots.sort((a, b) => b.risk - a.risk).map((area, i) => (
              <Link
                key={area.name}
                to="/stakeholder/risk"
                className="block space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{area.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium ${area.trend.startsWith('+') ? 'text-severity-critical' : area.trend === '0%' ? 'text-muted-foreground' : 'text-status-active'}`}>
                      {area.trend}
                    </span>
                    <span className={`font-mono text-sm font-semibold ${riskColor(area.risk)}`}>
                      {(area.risk * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${riskBg(area.risk)}`}
                    style={{ width: `${area.risk * 100}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="panel flex flex-wrap items-center gap-6 text-xs">
        <StatusIndicator status="active" label="Risk Engine Online" />
        <StatusIndicator status="active" label="Alert Dispatch Active" />
        <StatusIndicator status="active" label="NADMO Integration Active" />
      </div>
    </div>
  );
}
