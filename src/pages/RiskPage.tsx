import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Activity, MapPin, X, Clock, Brain } from "lucide-react";
import { toast } from "sonner";
import { riskApi, areaApi, type AreaRiskItem, type AreaRecord } from "@/lib/api";

type RiskLevel = "low" | "moderate" | "high" | "severe";

interface RiskRow {
  id: string;
  name: string;
  city: string;
  riskScore: number;
  riskLevel: RiskLevel;
  tiles: number;
  explanation: string;
  computedAt: string;
  horizon: string;
}

const badgeVariant: Record<RiskLevel, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

const riskColor = (score: number) =>
  score >= 0.8 ? "text-severity-critical" :
  score >= 0.6 ? "text-severity-high" :
  score >= 0.4 ? "text-severity-moderate" : "text-severity-low";

function toRiskLevel(raw: string): RiskLevel {
  const m: Record<string, RiskLevel> = { SEVERE: "severe", HIGH: "high", MODERATE: "moderate", LOW: "low" };
  return m[raw?.toUpperCase()] ?? "low";
}

function toExplanation(json: unknown): string {
  if (!json) return "No explanation available.";
  if (typeof json === "string") return json;
  if (typeof json === "object") {
    const obj = json as Record<string, unknown>;
    return (obj.summary as string) || (obj.explanation as string) || (obj.text as string) || JSON.stringify(json);
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

function adaptRow(item: AreaRiskItem, areaMap: Record<string, AreaRecord>): RiskRow {
  const area = areaMap[item.area_id];
  return {
    id: item.area_id,
    name: area?.name ?? `Area ${item.area_id.slice(0, 6)}`,
    city: item.city ?? area?.city ?? "—",
    riskScore: item.aggregated_score ?? 0,
    riskLevel: toRiskLevel(item.risk_level),
    tiles: item.tile_count ?? 0,
    explanation: toExplanation(item.explanation_json),
    computedAt: item.run_at ? timeAgo(item.run_at) : "—",
    horizon: `${item.horizon_h}h`,
  };
}

export default function RiskPage() {
  const [horizon, setHorizon] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [rows, setRows] = useState<RiskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RiskRow | null>(null);
  const [lastComputed, setLastComputed] = useState<string>("—");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [riskRes, areasRes] = await Promise.all([
          riskApi.overview(),
          areaApi.list(),
        ]);
        if (cancelled) return;
        const areaMap: Record<string, AreaRecord> = {};
        (areasRes.data ?? []).forEach((a: AreaRecord) => { areaMap[a.area_id] = a; });
        const items: AreaRiskItem[] = riskRes.data?.items ?? [];
        setRows(items.map((item) => adaptRow(item, areaMap)));
        const latest = items.map((i) => i.run_at).filter(Boolean).sort().at(-1);
        if (latest) setLastComputed(timeAgo(latest));
      } catch {
        toast.error("Failed to load risk data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = rows.filter((r) => {
    if (horizon !== "all" && r.horizon !== horizon) return false;
    if (cityFilter !== "all" && r.city.toLowerCase() !== cityFilter) return false;
    return true;
  });

  const severeCt = filtered.filter((r) => r.riskLevel === "severe").length;
  const highCt = filtered.filter((r) => r.riskLevel === "high").length;
  const cities = [...new Set(rows.map((r) => r.city.toLowerCase()).filter((c) => c && c !== "—"))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-severity-critical/10">
          <Brain className="h-5 w-5 text-severity-critical" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Risk Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-computed flood risk per area · Greater Accra Region
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="panel space-y-1">
          <p className="metric-label">Severe</p>
          <p className="text-2xl font-bold text-severity-critical">{loading ? "—" : severeCt}</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">High</p>
          <p className="text-2xl font-bold text-severity-high">{loading ? "—" : highCt}</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Total Areas</p>
          <p className="metric-value">{loading ? "—" : filtered.length}</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Last Computed</p>
          <p className="text-sm font-medium mt-1">{loading ? "…" : lastComputed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Horizon:</Label>
          <Select value={horizon} onValueChange={setHorizon}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="72h">72 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">City:</Label>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Map placeholder */}
          <div className="rounded-md border border-border bg-muted/30 relative overflow-hidden" style={{ height: 320 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full p-6">
                {filtered.slice(0, 5).map((area, i) => {
                  const positions = [
                    { top: "10%", left: "15%", w: "25%", h: "30%" },
                    { top: "20%", left: "45%", w: "22%", h: "28%" },
                    { top: "55%", left: "10%", w: "28%", h: "25%" },
                    { top: "50%", left: "50%", w: "24%", h: "30%" },
                    { top: "5%", left: "72%", w: "20%", h: "22%" },
                  ];
                  const pos = positions[i];
                  return (
                    <button
                      key={area.id}
                      onClick={() => setSelected(area)}
                      className={`absolute rounded-sm border-2 transition-all hover:opacity-90 ${
                        selected?.id === area.id ? "ring-2 ring-ring" : ""
                      }`}
                      style={{
                        top: pos.top, left: pos.left, width: pos.w, height: pos.h,
                        backgroundColor: `hsl(var(--severity-${area.riskLevel === "severe" ? "critical" : area.riskLevel}) / 0.3)`,
                        borderColor: `hsl(var(--severity-${area.riskLevel === "severe" ? "critical" : area.riskLevel}) / 0.6)`,
                      }}
                      title={area.name}
                    >
                      <span className="text-[10px] font-medium text-foreground px-1 truncate block">{area.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-card/90 backdrop-blur-sm rounded-sm px-2.5 py-1.5 border border-border text-[10px]">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-severity-critical" /> Severe</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-severity-high" /> High</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-severity-moderate" /> Moderate</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-severity-low" /> Low</span>
            </div>
          </div>

          <div className="panel p-0 overflow-hidden">
            <div className="px-4 pt-3 pb-2">
              <h2 className="section-header">Hotspot Ranking</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">No risk data available.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Horizon</TableHead>
                    <TableHead className="text-right">Tiles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filtered]
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((area, i) => (
                      <TableRow
                        key={area.id}
                        className={`cursor-pointer hover:bg-muted/40 ${selected?.id === area.id ? "bg-muted/60" : ""}`}
                        onClick={() => setSelected(area)}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-sm">{area.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-mono font-semibold ${riskColor(area.riskScore)}`}>
                            {(area.riskScore * 100).toFixed(0)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant[area.riskLevel]}>{area.riskLevel}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{area.horizon}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{area.tiles}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <div className="panel space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <p className="metric-label mb-1">Risk Score</p>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold font-mono ${riskColor(selected.riskScore)}`}>
                    {(selected.riskScore * 100).toFixed(0)}%
                  </span>
                  <Badge variant={badgeVariant[selected.riskLevel]}>{selected.riskLevel}</Badge>
                </div>
              </div>

              <div>
                <p className="metric-label mb-1">AI Explanation</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{selected.explanation}</p>
              </div>

              <div className="border-t border-border pt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Clock className="h-3 w-3" /> Computed: {selected.computedAt}</div>
                <div className="flex items-center gap-2"><Activity className="h-3 w-3" /> Forecast horizon: {selected.horizon}</div>
              </div>
            </div>
          ) : (
            <div className="panel flex flex-col items-center justify-center py-16 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Select an area from the map or table to view risk details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
