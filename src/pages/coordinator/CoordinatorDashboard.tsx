import { useState, useEffect } from "react";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { alertApi, areaApi, riskApi, type AlertRecord, type AreaRecord, type AreaRiskItem } from "@/lib/api";
import {
  AlertTriangle, MapPin, Bell, Activity, Plus, FileText,
} from "lucide-react";

interface AreaRow {
  id: string;
  name: string;
  riskLevel: "severe" | "high" | "moderate" | "low";
  risk: number;
  activeAlerts: number;
}

interface AlertRow {
  id: string;
  title: string;
  area: string;
  status: string;
  createdAt: string;
}

function toRiskLevel(raw: string): "severe" | "high" | "moderate" | "low" {
  const m: Record<string, "severe" | "high" | "moderate" | "low"> = {
    SEVERE: "severe", HIGH: "high", MODERATE: "moderate", LOW: "low",
  };
  return m[raw?.toUpperCase()] ?? "low";
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

const riskColor = (risk: number) =>
  risk >= 0.8 ? "text-severity-critical" :
  risk >= 0.6 ? "text-severity-high" :
  risk >= 0.4 ? "text-severity-moderate" : "text-severity-low";

const riskBadge: Record<string, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

export default function CoordinatorDashboard() {
  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [myAlerts, setMyAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [areasRes, riskRes, alertsRes] = await Promise.all([
          areaApi.list(),
          riskApi.overview(),
          alertApi.list({ status: "DRAFT", page_size: "5" }),
        ]);
        if (cancelled) return;

        const areaMap: Record<string, AreaRecord> = {};
        (areasRes.data?.items ?? []).forEach((a: AreaRecord) => { areaMap[a.area_id] = a; });

        const riskItems: AreaRiskItem[] = riskRes.data?.items ?? [];
        setAreas(
          riskItems
            .sort((a, b) => (b.aggregated_score ?? 0) - (a.aggregated_score ?? 0))
            .slice(0, 3)
            .map((item) => ({
              id: item.area_id,
              name: areaMap[item.area_id]?.name ?? `Area ${item.area_id.slice(0, 6)}`,
              risk: item.aggregated_score ?? 0,
              riskLevel: toRiskLevel(item.risk_level),
              activeAlerts: 0,
            }))
        );

        const alertItems: AlertRecord[] = alertsRes.data?.items ?? [];
        setMyAlerts(
          alertItems.map((a) => ({
            id: a.id,
            title: a.title,
            area: areaMap[a.area_id]?.name ?? "—",
            status: a.status?.toLowerCase() ?? "draft",
            createdAt: a.created_at ? timeAgo(a.created_at) : "—",
          }))
        );
      } catch {
        toast.error("Failed to load coordinator data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Coordinator Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your assigned areas and active tasks · Greater Accra
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/coordinator/alerts/new">
            <Button size="sm"><Plus className="h-3.5 w-3.5" /> Draft Alert</Button>
          </Link>
          <Link to="/coordinator/reports/new">
            <Button size="sm" variant="outline"><FileText className="h-3.5 w-3.5" /> Field Report</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Assigned Areas" value={loading ? "—" : areas.length} icon={MapPin} />
        <MetricCard label="My Draft Alerts" value={loading ? "—" : myAlerts.length} icon={Bell} />
        <MetricCard label="Pending Reports" value="—" icon={Activity} />
      </div>

      {/* Local weather for field ops */}
      <WeatherDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned areas */}
        <div className="panel space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="section-header">Assigned Areas</h2>
            <HelpTooltip text="Areas are neighbourhood boundaries used to group risk and target alerts. You're assigned specific areas to monitor." />
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
          ) : areas.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No area risk data available.</p>
          ) : (
            <div className="space-y-3">
              {areas.map((area) => (
                <Link
                  key={area.id}
                  to="/coordinator/areas"
                  className="block rounded-md border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold">{area.name}</span>
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* My alerts */}
          <div className="panel space-y-4">
            <h2 className="section-header">My Alerts</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground py-2 text-center">Loading…</p>
            ) : myAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No draft alerts.</p>
            ) : (
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
            )}
            <Link to="/coordinator/alerts/new" className="text-xs text-primary hover:underline">
              + Draft new alert
            </Link>
          </div>

          {/* Recent reports */}
          <div className="panel space-y-4">
            <h2 className="section-header">Recent Reports</h2>
            <p className="text-sm text-muted-foreground">No recent reports.</p>
          </div>
        </div>
      </div>

      <div className="panel flex flex-wrap items-center gap-6 text-xs">
        <StatusIndicator status="active" label="Risk Engine Online" />
        <StatusIndicator status="active" label="Alert System Active" />
      </div>
    </div>
  );
}
