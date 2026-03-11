import { useState, useEffect } from "react";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { alertApi, areaApi, riskApi, type AlertRecord, type AreaRecord, type AreaRiskItem } from "@/lib/api";
import { encodeId } from "@/lib/id";
import {
  AlertTriangle, MapPin, Activity, Bell, Clock, BarChart3,
} from "lucide-react";

interface AlertRow {
  id: string;
  title: string;
  area: string;
  riskLevel: string;
  createdAt: string;
}

interface HotspotRow {
  id: string;
  name: string;
  risk: number;
  riskLevel: string;
}

function toRiskLevel(raw: string): string {
  const m: Record<string, string> = { SEVERE: "severe", HIGH: "high", MODERATE: "moderate", LOW: "low" };
  return m[raw?.toUpperCase()] ?? "low";
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

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
  const [pendingAlerts, setPendingAlerts] = useState<AlertRow[]>([]);
  const [hotspots, setHotspots] = useState<HotspotRow[]>([]);
  const [totalAreas, setTotalAreas] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [alertsRes, riskRes, areasRes] = await Promise.all([
          alertApi.list({ status: "APPROVED", page_size: "5" }),
          riskApi.overview({ limit: "5" }),
          areaApi.list(),
        ]);
        if (cancelled) return;

        const areaMap: Record<string, AreaRecord> = {};
        const areaItems = areasRes.data?.items ?? [];
        areaItems.forEach((a: AreaRecord) => { areaMap[a.area_id] = a; });
        setTotalAreas(areaItems.length);

        const alertItems: AlertRecord[] = alertsRes.data?.items ?? [];
        setPendingAlerts(
          alertItems.map((a) => ({
            id: a.id,
            title: a.title,
            area: areaMap[a.area_id]?.name ?? "—",
            riskLevel: toRiskLevel(a.risk_level ?? ""),
            createdAt: a.created_at ? timeAgo(a.created_at) : "—",
          }))
        );

        const riskItems: AreaRiskItem[] = riskRes.data?.items ?? [];
        setHotspots(
          riskItems
            .sort((a, b) => (b.aggregated_score ?? 0) - (a.aggregated_score ?? 0))
            .map((item) => ({
              id: item.area_id,
              name: areaMap[item.area_id]?.name ?? `Area ${item.area_id.slice(0, 6)}`,
              risk: item.aggregated_score ?? 0,
              riskLevel: toRiskLevel(item.risk_level),
            }))
        );
      } catch {
        toast.error("Failed to load stakeholder data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const severeCt = hotspots.filter((h) => h.risk >= 0.8).length;

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
        <MetricCard label="Pending Reviews" value={loading ? "—" : pendingAlerts.length} icon={Bell} />
        <MetricCard label="Active Hotspots" value={loading ? "—" : severeCt} icon={AlertTriangle} />
        <MetricCard label="Total Areas" value={loading ? "—" : (totalAreas ?? "—")} icon={MapPin} />
        <MetricCard label="Alerts Delivered" value="—" icon={Activity} />
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
          {loading ? (
            <p className="text-sm text-muted-foreground py-2 text-center">Loading…</p>
          ) : pendingAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No alerts pending review.</p>
          ) : (
            <div className="space-y-2">
              {pendingAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  to={`/stakeholder/alerts/${encodeId(alert.id)}`}
                  className="block rounded-sm border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{alert.title}</span>
                    <Badge variant={riskBadge[alert.riskLevel] ?? "low"}>{alert.riskLevel}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {alert.area}
                    <span>·</span>
                    <Clock className="h-3 w-3" /> {alert.createdAt}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Hotspots */}
        <div className="panel space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="section-header">Hotspot Rankings</h2>
            <HelpTooltip text="Risk is computed per tile and then aggregated to give each area an overall score. Rankings update every 6 hours." />
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground py-2 text-center">Loading…</p>
          ) : hotspots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No risk data available.</p>
          ) : (
            <div className="space-y-3">
              {[...hotspots].sort((a, b) => b.risk - a.risk).map((area, i) => (
                <Link
                  key={area.id}
                  to="/stakeholder/risk"
                  className="block space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}</span>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{area.name}</span>
                    </div>
                    <span className={`font-mono text-sm font-semibold ${riskColor(area.risk)}`}>
                      {(area.risk * 100).toFixed(0)}%
                    </span>
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
          )}
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
