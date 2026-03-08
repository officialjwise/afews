import { useState, useEffect } from "react";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  AlertTriangle, MapPin, Grid3X3, Users, Bell, Clock, Droplets,
  CheckCircle2, XCircle, Send, Loader2, Activity, Brain,
} from "lucide-react";
import { alertApi, riskApi, areaApi, type AlertRecord, type AreaRiskItem } from "@/lib/api";

type Severity = "critical" | "high" | "moderate" | "low";
type AlertRow = { id: string; area: string; severity: Severity; time: string; status: string };
type RiskRow  = { id: string; name: string; risk: number; tiles: number };

function toSeverity(rl: string): Severity {
  const m: Record<string, Severity> = { SEVERE: "critical", HIGH: "high", MODERATE: "moderate", LOW: "low" };
  return m[rl.toUpperCase()] ?? "low";
}

function toStatusLabel(s: string) {
  const m: Record<string, string> = { DRAFT: "draft", APPROVED: "pending review", REJECTED: "rejected", SENT: "dispatched" };
  return m[s.toUpperCase()] ?? s.toLowerCase();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

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

export default function Dashboard() {
  const { role, can } = useAuth();
  const isAdmin = role === "admin";

  const [recentAlerts, setRecentAlerts] = useState<AlertRow[]>([]);
  const [riskAreas, setRiskAreas]       = useState<RiskRow[]>([]);
  const [totalAreas, setTotalAreas]     = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [alertsRes, riskRes, areasRes] = await Promise.all([
          alertApi.list({ page_size: "4" }),
          riskApi.overview({ limit: "5" }),
          areaApi.list(),
        ]);
        if (cancelled) return;

        const areaMap: Record<string, string> = {};
        areasRes.data.forEach(a => { areaMap[a.id] = a.name; });
        setTotalAreas(areasRes.data.length);

        const rawAlerts: AlertRecord[] = alertsRes.data.items;
        setRecentAlerts(rawAlerts.map(a => ({
          id: a.id,
          area: areaMap[a.area_id ?? ""] ?? `Area ${(a.area_id ?? "").slice(0, 6)}`,
          severity: toSeverity(a.risk_level),
          time: timeAgo(a.created_at),
          status: toStatusLabel(a.status),
        })));
        setPendingCount(rawAlerts.filter(a => a.status === "DRAFT").length);

        const rawRisk: AreaRiskItem[] = riskRes.data.items;
        const sorted = [...rawRisk].sort((a, b) => b.aggregated_score - a.aggregated_score).slice(0, 5);
        setRiskAreas(sorted.map(r => ({
          id: r.id,
          name: areaMap[r.area_id] ?? `Area ${r.area_id.slice(0, 6)}`,
          risk: r.aggregated_score,
          tiles: r.tile_count,
        })));
      } catch {
        // Keep empty state — page still renders with skeleton data
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-powered flood risk monitoring · Accra, Ghana
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Areas" value={totalAreas ?? "—"} icon={MapPin} />
        <MetricCard label="Active Subscriptions" value="8,420" icon={Users} trend={{ value: "12% this week", positive: true }} />
        <MetricCard label="Pending Draft Alerts" value={pendingCount ?? "—"} icon={Bell} trend={{ value: "2 from yesterday", positive: false }} />
        <MetricCard label="Active Tiles" value="1,248" icon={Grid3X3} />
      </div>

      <WeatherDashboard />

      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="panel space-y-2">
            <p className="metric-label">Ingestion Health</p>
            <div className="flex items-center gap-2">
              <StatusIndicator status="active" label="" />
              <span className="text-sm font-medium">Last run succeeded</span>
            </div>
            <p className="text-xs text-muted-foreground">42 min ago · 3 sources synced</p>
          </div>
          <div className="panel space-y-2">
            <p className="metric-label">Risk Computation</p>
            <div className="flex items-center gap-2">
              <StatusIndicator status="active" label="" />
              <span className="text-sm font-medium">Up to date</span>
            </div>
            <p className="text-xs text-muted-foreground">Last computed 18 min ago</p>
          </div>
          <div className="panel space-y-2">
            <p className="metric-label">Delivery Stats</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm font-medium text-status-active"><Send className="h-3.5 w-3.5" /> 1,240</span>
              <span className="flex items-center gap-1 text-sm font-medium text-severity-critical"><XCircle className="h-3.5 w-3.5" /> 18</span>
              <span className="flex items-center gap-1 text-sm font-medium text-status-pending"><Loader2 className="h-3.5 w-3.5" /> 42</span>
            </div>
            <p className="text-xs text-muted-foreground">Sent · Failed · Pending</p>
          </div>
          <div className="panel space-y-2">
            <p className="metric-label">ML Pipeline</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-active animate-pulse" />
              <span className="text-sm font-medium">Training Active</span>
            </div>
            <p className="text-xs text-muted-foreground">Feature gen · Risk model v2.1</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-header">Recent Alerts</h2>
            <Link to={`/${role}/alerts`} className="text-xs font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_100px_100px_100px] gap-2 px-3 py-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Area</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Severity</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Time</span>
            </div>
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
            ) : recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No alerts yet.</p>
            ) : recentAlerts.map((alert) => (
              <div key={alert.id} className="grid grid-cols-[1fr_100px_100px_100px] gap-2 items-center px-3 py-2.5 rounded-sm hover:bg-muted/50 transition-colors cursor-pointer">
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

        <div className="panel space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-header">Top Hotspots</h2>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
            ) : riskAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No risk data yet.</p>
            ) : riskAreas.map((area) => (
              <Link to={`/${role}/areas`} key={area.id} className="block space-y-1.5 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{area.name}</span>
                  <span className={`text-sm font-semibold font-mono ${riskColor(area.risk)}`}>
                    {(area.risk * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${riskBg(area.risk)}`} style={{ width: `${area.risk * 100}%` }} />
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>{area.tiles} tiles</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="panel flex flex-wrap items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Last data sync:</span>
          <span className="font-medium">4 min ago</span>
        </div>
        <StatusIndicator status="active" label="Risk Engine Online" />
        <StatusIndicator status="active" label="Alert Dispatch Active" />
        <StatusIndicator status="active" label="ML Pipeline Running" />
      </div>
    </div>
  );
}
