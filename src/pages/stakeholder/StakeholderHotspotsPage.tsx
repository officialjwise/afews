import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { BarChart3, MapPin, TrendingUp, TrendingDown, Minus, X, Droplets, Mountain, Clock } from "lucide-react";

interface Hotspot {
  name: string;
  risk: number;
  riskLevel: "severe" | "high" | "moderate" | "low";
  trend: string;
  trendDir: "up" | "down" | "flat";
  subscribers: number;
  rainfall72h: number;
  elevation: number;
  lastComputed: string;
}

const HOTSPOTS: Hotspot[] = [
  { name: "Odawna", risk: 0.91, riskLevel: "severe", trend: "+3%", trendDir: "up", subscribers: 1800, rainfall72h: 195, elevation: 1.5, lastComputed: "12 min ago" },
  { name: "Alajo", risk: 0.94, riskLevel: "severe", trend: "+1%", trendDir: "up", subscribers: 1240, rainfall72h: 185, elevation: 2.1, lastComputed: "12 min ago" },
  { name: "Nima", risk: 0.87, riskLevel: "severe", trend: "-2%", trendDir: "down", subscribers: 890, rainfall72h: 160, elevation: 3.4, lastComputed: "12 min ago" },
  { name: "Adabraka", risk: 0.74, riskLevel: "high", trend: "+5%", trendDir: "up", subscribers: 2100, rainfall72h: 130, elevation: 5.6, lastComputed: "12 min ago" },
  { name: "Osu", risk: 0.61, riskLevel: "high", trend: "0%", trendDir: "flat", subscribers: 1560, rainfall72h: 110, elevation: 6.2, lastComputed: "12 min ago" },
  { name: "Kaneshie", risk: 0.48, riskLevel: "moderate", trend: "-1%", trendDir: "down", subscribers: 720, rainfall72h: 95, elevation: 4.8, lastComputed: "12 min ago" },
  { name: "East Legon", risk: 0.25, riskLevel: "low", trend: "0%", trendDir: "flat", subscribers: 340, rainfall72h: 45, elevation: 12.0, lastComputed: "12 min ago" },
];

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

const TrendIcon = ({ dir }: { dir: string }) => {
  if (dir === "up") return <TrendingUp className="h-3 w-3 text-severity-critical" />;
  if (dir === "down") return <TrendingDown className="h-3 w-3 text-status-active" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

export default function StakeholderHotspotsPage() {
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = levelFilter === "all" ? HOTSPOTS : HOTSPOTS.filter(h => h.riskLevel === levelFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-severity-critical/10">
          <BarChart3 className="h-5 w-5 text-severity-critical" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">Hotspot Rankings</h1>
          <HelpTooltip text="Hotspots are areas ranked by aggregated flood risk score. Trends show 6-hour change direction." />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="panel space-y-1 text-center">
          <p className="metric-label">Severe</p>
          <p className="text-2xl font-bold text-severity-critical">{HOTSPOTS.filter(h => h.riskLevel === "severe").length}</p>
        </div>
        <div className="panel space-y-1 text-center">
          <p className="metric-label">High</p>
          <p className="text-2xl font-bold text-severity-high">{HOTSPOTS.filter(h => h.riskLevel === "high").length}</p>
        </div>
        <div className="panel space-y-1 text-center">
          <p className="metric-label">Rising</p>
          <p className="text-2xl font-bold text-severity-critical">{HOTSPOTS.filter(h => h.trendDir === "up").length}</p>
        </div>
        <div className="panel space-y-1 text-center">
          <p className="metric-label">Falling</p>
          <p className="text-2xl font-bold text-status-active">{HOTSPOTS.filter(h => h.trendDir === "down").length}</p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Subscribers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.sort((a, b) => b.risk - a.risk).map((h, i) => (
                  <TableRow key={h.name} className={`cursor-pointer hover:bg-muted/40 ${selected?.name === h.name ? "bg-muted/60" : ""}`} onClick={() => setSelected(h)}>
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
                        <TrendIcon dir={h.trendDir} />
                        <span className={`text-xs font-medium ${h.trendDir === "up" ? "text-severity-critical" : h.trendDir === "down" ? "text-status-active" : "text-muted-foreground"}`}>{h.trend}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={badgeVariant[h.riskLevel]}>{h.riskLevel}</Badge></TableCell>
                    <TableCell className="text-right font-mono text-sm">{h.subscribers.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          {selected ? (
            <div className="panel space-y-4 sticky top-6 animate-fade-in">
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
              <div className="flex items-center gap-2">
                <TrendIcon dir={selected.trendDir} />
                <span className="text-sm">{selected.trend} in last 6h</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 rounded-sm bg-severity-info/10 text-center">
                  <Droplets className="h-4 w-4 mx-auto text-severity-info" />
                  <p className="font-mono font-semibold mt-1">{selected.rainfall72h}mm</p>
                  <p className="text-[10px] text-muted-foreground">72h Rainfall</p>
                </div>
                <div className="p-2 rounded-sm bg-severity-high/10 text-center">
                  <Mountain className="h-4 w-4 mx-auto text-severity-high" />
                  <p className="font-mono font-semibold mt-1">{selected.elevation}m</p>
                  <p className="text-[10px] text-muted-foreground">Avg Elevation</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Computed: {selected.lastComputed}</div>
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
