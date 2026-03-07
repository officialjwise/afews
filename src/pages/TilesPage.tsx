import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Grid3X3, Play, Loader2, X, MapPin, Droplets, Mountain, TrendingUp, Brain } from "lucide-react";
import { toast } from "sonner";

type RiskLevel = "low" | "moderate" | "high" | "severe";

interface Tile {
  id: string;
  centroid: [number, number];
  elevation: number;
  slope: number;
  rainfall6h: number;
  rainfall24h: number;
  rainfall72h: number;
  riskScore: number;
  riskLevel: RiskLevel;
  explanation: string;
  area: string;
}

const MOCK_TILES: Tile[] = [
  { id: "T-001", centroid: [-0.2101, 5.5700], elevation: 2.1, slope: 0.8, rainfall6h: 42, rainfall24h: 98, rainfall72h: 185, riskScore: 0.94, riskLevel: "severe", explanation: "Very low elevation along Odaw River with high 72h cumulative rainfall.", area: "Alajo" },
  { id: "T-002", centroid: [-0.2090, 5.5710], elevation: 3.4, slope: 1.2, rainfall6h: 38, rainfall24h: 86, rainfall72h: 160, riskScore: 0.81, riskLevel: "high", explanation: "Below-average elevation with sustained rainfall exceeding drainage.", area: "Alajo" },
  { id: "T-003", centroid: [-0.2050, 5.5695], elevation: 5.6, slope: 2.1, rainfall6h: 30, rainfall24h: 72, rainfall72h: 130, riskScore: 0.56, riskLevel: "moderate", explanation: "Moderate elevation partially mitigates rainfall accumulation.", area: "Nima" },
  { id: "T-004", centroid: [-0.2030, 5.5720], elevation: 8.2, slope: 3.5, rainfall6h: 25, rainfall24h: 60, rainfall72h: 110, riskScore: 0.32, riskLevel: "low", explanation: "Higher elevation and adequate slope provide natural drainage.", area: "East Legon" },
  { id: "T-005", centroid: [-0.2110, 5.5680], elevation: 1.8, slope: 0.5, rainfall6h: 45, rainfall24h: 105, rainfall72h: 200, riskScore: 0.97, riskLevel: "severe", explanation: "Critically low elevation in flood plain with highest rainfall.", area: "Odawna" },
  { id: "T-006", centroid: [-0.2070, 5.5730], elevation: 4.2, slope: 1.8, rainfall6h: 33, rainfall24h: 78, rainfall72h: 145, riskScore: 0.65, riskLevel: "high", explanation: "Moderate-low elevation with above-average rainfall intensity.", area: "Adabraka" },
  { id: "T-007", centroid: [-0.2040, 5.5740], elevation: 6.8, slope: 2.8, rainfall6h: 28, rainfall24h: 65, rainfall72h: 120, riskScore: 0.44, riskLevel: "moderate", explanation: "Average elevation, some pockets of poor drainage noted.", area: "Kaneshie" },
  { id: "T-008", centroid: [-0.2120, 5.5660], elevation: 1.2, slope: 0.3, rainfall6h: 50, rainfall24h: 115, rainfall72h: 220, riskScore: 0.98, riskLevel: "severe", explanation: "Lowest point near Korle Lagoon outflow. Maximum flood exposure.", area: "Odawna" },
];

const riskBadgeVariant: Record<RiskLevel, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

const riskTileColor: Record<RiskLevel, string> = {
  severe: "bg-severity-critical/20 border-severity-critical/40",
  high: "bg-severity-high/20 border-severity-high/40",
  moderate: "bg-severity-moderate/20 border-severity-moderate/40",
  low: "bg-severity-low/20 border-severity-low/40",
};

export default function TilesPage() {
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState("visualise");
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [areaFilter, setAreaFilter] = useState("all");

  const [genCity, setGenCity] = useState("");
  const [genBbox, setGenBbox] = useState("");
  const [genSize, setGenSize] = useState("100");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genResult, setGenResult] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenResult(null);
    await new Promise((r) => setTimeout(r, 2000));
    setGenResult(48);
    setIsGenerating(false);
    toast.success("48 tiles generated successfully");
  };

  const filteredTiles = areaFilter === "all" ? MOCK_TILES : MOCK_TILES.filter(t => t.area.toLowerCase() === areaFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Grid3X3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Tile Management</h1>
            <HelpTooltip text="Tiles are small grid cells (e.g. 500m × 500m) used to compute localised flood risk. Each tile has elevation, slope, and rainfall data." />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate, visualise, and inspect modelling grid cells
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visualise">Visualise</TabsTrigger>
          {can("tiles.generate") && <TabsTrigger value="generate">Generate Tiles</TabsTrigger>}
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="visualise" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Label className="text-xs">Filter by area:</Label>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All areas</SelectItem>
                <SelectItem value="alajo">Alajo</SelectItem>
                <SelectItem value="nima">Nima</SelectItem>
                <SelectItem value="odawna">Odawna</SelectItem>
                <SelectItem value="adabraka">Adabraka</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1.5">
                  {filteredTiles.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedTile(tile)}
                      className={`aspect-square rounded-sm border transition-all flex flex-col items-center justify-center text-[10px] font-mono font-medium hover:ring-2 hover:ring-ring ${
                        riskTileColor[tile.riskLevel]
                      } ${selectedTile?.id === tile.id ? "ring-2 ring-primary" : ""}`}
                    >
                      <span className="text-xs font-bold">{(tile.riskScore * 100).toFixed(0)}</span>
                      <span className="text-[8px] opacity-70">{tile.area.slice(0, 4)}</span>
                    </button>
                  ))}
                  {Array.from({ length: Math.max(0, 16 - filteredTiles.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square rounded-sm border border-border/30 bg-muted/10" />
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-severity-critical/20 border border-severity-critical/40" /> Severe</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-severity-high/20 border border-severity-high/40" /> High</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-severity-moderate/20 border border-severity-moderate/40" /> Moderate</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-severity-low/20 border border-severity-low/40" /> Low</span>
                </div>
              </div>
            </div>

            <div>
              {selectedTile ? (
                <div className="panel space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Tile {selectedTile.id}</h3>
                    <button onClick={() => setSelectedTile(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Risk</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold font-mono ${
                        selectedTile.riskScore >= 0.8 ? "text-severity-critical" :
                        selectedTile.riskScore >= 0.6 ? "text-severity-high" :
                        selectedTile.riskScore >= 0.4 ? "text-severity-moderate" : "text-severity-low"
                      }`}>
                        {(selectedTile.riskScore * 100).toFixed(0)}%
                      </span>
                      <Badge variant={riskBadgeVariant[selectedTile.riskLevel]}>{selectedTile.riskLevel}</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Area</p>
                    <p className="text-sm font-medium flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedTile.area}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                    <p className="text-sm font-mono">
                      {selectedTile.centroid[1].toFixed(4)}°N, {selectedTile.centroid[0].toFixed(4)}°W
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Elevation</p>
                      <p className="font-mono flex items-center gap-1"><Mountain className="h-3 w-3 text-severity-high" />{selectedTile.elevation}m</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Slope</p>
                      <p className="font-mono flex items-center gap-1"><TrendingUp className="h-3 w-3 text-severity-moderate" />{selectedTile.slope}°</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Rainfall</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {[
                        { h: "6h", val: selectedTile.rainfall6h },
                        { h: "24h", val: selectedTile.rainfall24h },
                        { h: "72h", val: selectedTile.rainfall72h },
                      ].map(({ h, val }) => (
                        <div key={h} className="text-center p-1.5 rounded-sm bg-severity-info/10">
                          <p className="text-muted-foreground text-[10px]">{h}</p>
                          <p className="font-mono font-semibold text-severity-info">{val}mm</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">AI Explanation</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{selectedTile.explanation}</p>
                  </div>
                </div>
              ) : (
                <div className="panel flex flex-col items-center justify-center py-12 text-center">
                  <Grid3X3 className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Click a tile to inspect details</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Stats tab */}
        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="panel space-y-1 text-center">
              <p className="metric-label">Total Tiles</p>
              <p className="text-2xl font-bold">{MOCK_TILES.length}</p>
            </div>
            <div className="panel space-y-1 text-center">
              <p className="metric-label">Severe</p>
              <p className="text-2xl font-bold text-severity-critical">{MOCK_TILES.filter(t => t.riskLevel === "severe").length}</p>
            </div>
            <div className="panel space-y-1 text-center">
              <p className="metric-label">Avg Elevation</p>
              <p className="text-2xl font-bold">{(MOCK_TILES.reduce((s, t) => s + t.elevation, 0) / MOCK_TILES.length).toFixed(1)}m</p>
            </div>
            <div className="panel space-y-1 text-center">
              <p className="metric-label">Avg Rainfall 72h</p>
              <p className="text-2xl font-bold text-severity-info">{(MOCK_TILES.reduce((s, t) => s + t.rainfall72h, 0) / MOCK_TILES.length).toFixed(0)}mm</p>
            </div>
          </div>
        </TabsContent>

        {can("tiles.generate") && (
          <TabsContent value="generate" className="mt-4">
            <div className="max-w-lg space-y-5">
              <div className="panel space-y-4">
                <h2 className="text-sm font-semibold">Generate Tiles</h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>City or area</Label>
                    <Select value={genCity} onValueChange={setGenCity}>
                      <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alajo">Alajo</SelectItem>
                        <SelectItem value="nima">Nima</SelectItem>
                        <SelectItem value="adabraka">Adabraka</SelectItem>
                        <SelectItem value="osu">Osu</SelectItem>
                        <SelectItem value="odawna">Odawna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bbox">Bounding box (optional override)</Label>
                    <Input id="bbox" placeholder="minLon, minLat, maxLon, maxLat" value={genBbox} onChange={(e) => setGenBbox(e.target.value)} className="font-mono text-xs" />
                    <p className="text-xs text-muted-foreground">Leave empty to use the area's polygon bounding box</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tile size (metres)</Label>
                    <Select value={genSize} onValueChange={setGenSize}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50m</SelectItem>
                        <SelectItem value="100">100m</SelectItem>
                        <SelectItem value="250">250m</SelectItem>
                        <SelectItem value="500">500m</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleGenerate} disabled={isGenerating || !genCity} className="w-full">
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <><Play className="h-4 w-4" /> Generate Tiles</>
                    )}
                  </Button>
                </div>
              </div>

              {genResult !== null && (
                <div className="panel border-status-active/30 bg-status-active/5 flex items-center gap-3 animate-fade-in">
                  <Grid3X3 className="h-5 w-5 text-status-active" />
                  <div>
                    <p className="text-sm font-medium">{genResult} tiles generated successfully</p>
                    <p className="text-xs text-muted-foreground">Switch to the Visualise tab to inspect the grid.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
