import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Activity, MapPin, X, Clock, TrendingUp, Droplets, Mountain, Brain } from "lucide-react";

type RiskLevel = "low" | "moderate" | "high" | "severe";
type Horizon = "6h" | "24h" | "72h";

interface RiskArea {
  id: string;
  name: string;
  city: string;
  riskScore: number;
  riskLevel: RiskLevel;
  tiles: number;
  rainfall: number;
  elevation: number;
  slope: number;
  explanation: string;
  computedAt: string;
  horizon: Horizon;
}

const MOCK_RISK: RiskArea[] = [
  { id: "a1", name: "Alajo", city: "Accra", riskScore: 0.94, riskLevel: "severe", tiles: 48, rainfall: 185, elevation: 2.1, slope: 0.8, explanation: "Critically low elevation along the Odaw River with sustained heavy rainfall exceeding all drainage capacity thresholds.", computedAt: "18 min ago", horizon: "72h" },
  { id: "a2", name: "Nima", city: "Accra", riskScore: 0.87, riskLevel: "severe", tiles: 36, rainfall: 160, elevation: 3.4, slope: 1.2, explanation: "Below-average elevation with high 72h cumulative rainfall and limited drainage infrastructure in dense settlement.", computedAt: "18 min ago", horizon: "72h" },
  { id: "a3", name: "Adabraka", city: "Accra", riskScore: 0.74, riskLevel: "high", tiles: 52, rainfall: 130, elevation: 5.6, slope: 2.1, explanation: "Moderate-low elevation with above-average rainfall intensity. Urbanisation reduces natural absorption.", computedAt: "18 min ago", horizon: "24h" },
  { id: "a4", name: "Osu", city: "Accra", riskScore: 0.61, riskLevel: "high", tiles: 44, rainfall: 110, elevation: 6.2, slope: 2.4, explanation: "Moderate elevation with persistent rainfall. Some flood-prone pockets near the coast.", computedAt: "18 min ago", horizon: "24h" },
  { id: "a5", name: "Odawna", city: "Accra", riskScore: 0.91, riskLevel: "severe", tiles: 40, rainfall: 195, elevation: 1.5, slope: 0.4, explanation: "Extremely low-lying market area adjacent to Korle Lagoon with severe flood history.", computedAt: "18 min ago", horizon: "72h" },
  { id: "a6", name: "Kaneshie", city: "Accra", riskScore: 0.48, riskLevel: "moderate", tiles: 40, rainfall: 95, elevation: 4.8, slope: 1.6, explanation: "Mixed risk profile — low-lying sections near the Odaw offset by better drainage.", computedAt: "18 min ago", horizon: "6h" },
  { id: "a7", name: "East Legon", city: "Accra", riskScore: 0.25, riskLevel: "low", tiles: 56, rainfall: 45, elevation: 12.0, slope: 4.1, explanation: "Well-elevated area with good drainage and below-average rainfall accumulation.", computedAt: "18 min ago", horizon: "6h" },
];

const badgeVariant: Record<RiskLevel, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

const riskColor = (score: number) =>
  score >= 0.8 ? "text-severity-critical" :
  score >= 0.6 ? "text-severity-high" :
  score >= 0.4 ? "text-severity-moderate" : "text-severity-low";

export default function RiskPage() {
  const [horizon, setHorizon] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [selected, setSelected] = useState<RiskArea | null>(null);

  const filtered = MOCK_RISK.filter((r) => {
    if (horizon !== "all" && r.horizon !== horizon) return false;
    return true;
  });

  const severeCt = filtered.filter((r) => r.riskLevel === "severe").length;
  const highCt = filtered.filter((r) => r.riskLevel === "high").length;

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
          <p className="text-2xl font-bold text-severity-critical">{severeCt}</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">High</p>
          <p className="text-2xl font-bold text-severity-high">{highCt}</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Total Areas</p>
          <p className="metric-value">{filtered.length}</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Last Computed</p>
          <p className="text-sm font-medium mt-1">18 min ago</p>
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
              <SelectItem value="accra">Accra</SelectItem>
              <SelectItem value="kumasi">Kumasi</SelectItem>
              <SelectItem value="tamale">Tamale</SelectItem>
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
                {filtered
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

              <div>
                <p className="metric-label mb-2">Risk Drivers</p>
                <div className="space-y-2">
                  {[
                    { icon: Droplets, label: `Rainfall (${selected.horizon})`, value: `${selected.rainfall}mm`, pct: Math.min(100, (selected.rainfall / 200) * 100), color: "bg-severity-info", iconColor: "text-severity-info" },
                    { icon: Mountain, label: "Elevation", value: `${selected.elevation}m`, pct: Math.max(5, 100 - (selected.elevation / 15) * 100), color: "bg-severity-high", iconColor: "text-severity-high" },
                    { icon: TrendingUp, label: "Slope", value: `${selected.slope}°`, pct: Math.max(5, 100 - (selected.slope / 5) * 100), color: "bg-severity-moderate", iconColor: "text-severity-moderate" },
                  ].map(({ icon: Icon, label, value, pct, color, iconColor }) => (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <Icon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-mono font-medium">{value}</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-secondary mt-1 overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
