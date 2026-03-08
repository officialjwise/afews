import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { toast } from "sonner";
import { riskApi, areaApi, type AreaRiskItem, type AreaRecord } from "@/lib/api";
import { BarChart3, MapPin, Minus, X, Clock } from "lucide-react";

interface HotspotRow {
  id: string;
  name: string;
  risk: number;
  riskLevel: "severe" | "high" | "moderate" | "low";
  horizon: string;
  explanation: string;
  computedAt: string;
}

const badgeVariant: Record<string, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

const riskColor = (score: number) =>
  score >= 0.8 ? "text-severity-critical" :
  score >= 0.6 ? "text-severity-high" :
  score >= 0.4 ? "text-severity-moderate" : "text-severity-low";

function riskBg(risk: number) {
  if (risk >= 0.8) return "bg-severity-critical";
  if (risk >= 0.6) return "bg-severity-high";
  if (risk >= 0.4) return "bg-severity-moderate";
  return "bg-severity-low";
}

function toRiskLevel(raw: string): "severe" | "high" | "moderate" | "low" {
  const m: Record<string, "severe" | "high" | "moderate" | "low"> = {
    SEVERE: "severe", HIGH: "high", MODERATE: "moderate", LOW: "low",
  };
  return m[raw?.toUpperCase()] ?? "low";
}

function toExplanation(json: unknown): string {
  if (!json) return "No explanation available.";
  if (typeof json === "string") return json;
  if (typeof json === "object") {
    const obj = json as Record<string, unknown>;
    return (obj.summary as string) || (obj.explanation as string) || (obj.text as string) || "No explanation available.";
  }
  return "No explanation available.";
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function StakeholderHotspotsPage() {
  const [hotspots, setHotspots] = useState<HotspotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HotspotRow | null>(null);
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [hotRes, areasRes] = await Promise.all([
          riskApi.hotspots(),
          areaApi.list(),
        ]);
        if (cancelled) return;
        const areaMap: Record<string, AreaRecord> = {};
        (areasRes.data ?? []).forEach((a: AreaRecord) => { areaMap[a.area_id] = a; });
        const items: AreaRiskItem[] = (hotRes.data ?? []) as AreaRiskItem[];
        setHotspots(
          items.map((item) => ({
            id: item.area_id,
            name: areaMap[item.area_id]?.name ?? `Area ${item.area_id.slice(0, 6)}`,
            risk: item.aggregated_score ?? 0,
            riskLevel: toRiskLevel(item.risk_level),
            horizon: `${item.horizon_h}h`,
            explanation: toExplanation(item.explanation_json),
            computedAt: item.run_at ? timeAgo(item.run_at) : "—",
          }))
        );
      } catch {
        toast.error("Failed to load hotspot data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = levelFilter === "all" ? hotspots : hotspots.filter((h) => h.riskLevel === levelFilter);
  const severeCt = hotspots.filter((h) => h.riskLevel === "severe").length;
  const highCt = hotspots.filter((h) => h.riskLevel === "high").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-severity-critical/10">
          <BarChart3 className="h-5 w-5 text-severity-critical" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">Hotspot Rankings</h1>
          <HelpTooltip text="Hotspots are areas ranked by aggregated flood risk score. Updated on each compute-risk run." />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="panel space-y-1 text-center">
          <p className="metric-label">Severe</p>
          <p className="text-2xl font-bold text-severity-critical">{loading ? "—" : severeCt}</p>
        </div>
        <div className="panel space-y-1 text-center">
          <p className="metric-label">High</p>
          <p className="text-2xl font-bold text-severity-high">{loading ? "—" : highCt}</p>
        </div>
        <div className="panel space-y-1 text-center">
          <p className="metric-label">Total</p>
          <p className="text-2xl font-bold">{loading ? "—" : hotspots.length}</p>
        </div>
        <div className="panel space-y-1 text-center">
          <p className="metric-label">Monitored</p>
          <p className="text-2xl font-bold">{loading ? "—" : hotspots.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs">Filter:</Label>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="severe">Severe</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="panel p-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">No hotspot data available.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Horizon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filtered].sort((a, b) => b.risk - a.risk).map((h, i) => (
                    <TableRow
                      key={h.id}
                      className={`cursor-pointer hover:bg-muted/40 ${selected?.id === h.id ? "bg-muted/60" : ""}`}
                      onClick={() => setSelected(h)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium text-sm">{h.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-semibold ${riskColor(h.risk)}`}>{(h.risk * 100).toFixed(0)}%</span>
                          <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                            <div className={`h-full rounded-full ${riskBg(h.risk)}`} style={{ width: `${h.risk * 100}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Minus className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">—</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={badgeVariant[h.riskLevel]}>{h.riskLevel}</Badge></TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">{h.horizon}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div>
          {selected ? (
            <div className="panel space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div>
                <p className="metric-label mb-1">Risk Score</p>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold font-mono ${riskColor(selected.risk)}`}>{(selected.risk * 100).toFixed(0)}%</span>
                  <Badge variant={badgeVariant[selected.riskLevel]}>{selected.riskLevel}</Badge>
                </div>
              </div>
              <div>
                <p className="metric-label mb-1">AI Explanation</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{selected.explanation}</p>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Computed: {selected.computedAt}
              </div>
            </div>
          ) : (
            <div className="panel flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Select a hotspot to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

