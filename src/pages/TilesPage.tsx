import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Grid3X3, Play, MapPin, Loader2, ChevronRight, X } from "lucide-react";

/* ─── Mock data ─── */
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
}

const MOCK_TILES: Tile[] = [
  { id: "T-001", centroid: [3.3892, 6.4965], elevation: 2.1, slope: 0.8, rainfall6h: 42, rainfall24h: 98, rainfall72h: 185, riskScore: 0.94, riskLevel: "severe", explanation: "Very low elevation combined with high 72h cumulative rainfall and poor drainage capacity." },
  { id: "T-002", centroid: [3.3910, 6.4970], elevation: 3.4, slope: 1.2, rainfall6h: 38, rainfall24h: 86, rainfall72h: 160, riskScore: 0.81, riskLevel: "high", explanation: "Below-average elevation with sustained rainfall exceeding drainage thresholds." },
  { id: "T-003", centroid: [3.3928, 6.4958], elevation: 5.6, slope: 2.1, rainfall6h: 30, rainfall24h: 72, rainfall72h: 130, riskScore: 0.56, riskLevel: "moderate", explanation: "Moderate elevation partially mitigates rainfall accumulation risk." },
  { id: "T-004", centroid: [3.3945, 6.4975], elevation: 8.2, slope: 3.5, rainfall6h: 25, rainfall24h: 60, rainfall72h: 110, riskScore: 0.32, riskLevel: "low", explanation: "Higher elevation and adequate slope provide natural drainage." },
  { id: "T-005", centroid: [3.3898, 6.4980], elevation: 1.8, slope: 0.5, rainfall6h: 45, rainfall24h: 105, rainfall72h: 200, riskScore: 0.97, riskLevel: "severe", explanation: "Critically low elevation in flood plain with highest recorded rainfall accumulation." },
  { id: "T-006", centroid: [3.3920, 6.4990], elevation: 4.2, slope: 1.8, rainfall6h: 33, rainfall24h: 78, rainfall72h: 145, riskScore: 0.65, riskLevel: "high", explanation: "Moderate-low elevation with above-average rainfall intensity." },
];

const riskBadgeVariant: Record<RiskLevel, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical",
  high: "high",
  moderate: "moderate",
  low: "low",
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

  // Generation form state
  const [genCity, setGenCity] = useState("");
  const [genBbox, setGenBbox] = useState("");
  const [genSize, setGenSize] = useState("100");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genResult, setGenResult] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenResult(null);
    // TODO: POST tile generation
    await new Promise((r) => setTimeout(r, 2000));
    setGenResult(48);
    setIsGenerating(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Tile Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Generate, visualise, and inspect modelling grid cells
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visualise">Visualise</TabsTrigger>
          {can("tiles.generate") && <TabsTrigger value="generate">Generate Tiles</TabsTrigger>}
        </TabsList>

        {/* ─── Visualise Tab ─── */}
        <TabsContent value="visualise" className="mt-4 space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Label className="text-xs">Filter by area:</Label>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All areas</SelectItem>
                <SelectItem value="makoko">Makoko</SelectItem>
                <SelectItem value="ajegunle">Ajegunle</SelectItem>
                <SelectItem value="lekki">Lekki Phase 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grid map */}
            <div className="lg:col-span-2">
              <div className="rounded-md border border-border bg-muted/30 p-4">
                {/* Simple grid overlay representation */}
                <div className="grid grid-cols-6 gap-1.5">
                  {MOCK_TILES.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => setSelectedTile(tile)}
                      className={`aspect-square rounded-sm border transition-all flex items-center justify-center text-[10px] font-mono font-medium hover:ring-2 hover:ring-ring ${
                        riskTileColor[tile.riskLevel]
                      } ${selectedTile?.id === tile.id ? "ring-2 ring-primary" : ""}`}
                    >
                      {(tile.riskScore * 100).toFixed(0)}
                    </button>
                  ))}
                  {/* Fill empty cells to show the grid concept */}
                  {Array.from({ length: 12 }).map((_, i) => (
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

            {/* Detail panel */}
            <div>
              {selectedTile ? (
                <div className="panel space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Tile {selectedTile.id}</h3>
                    <button onClick={() => setSelectedTile(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
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
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
                      <p className="text-sm font-mono">
                        {selectedTile.centroid[1].toFixed(4)}°N, {selectedTile.centroid[0].toFixed(4)}°E
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Elevation</p>
                        <p className="font-mono">{selectedTile.elevation}m</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Slope</p>
                        <p className="font-mono">{selectedTile.slope}°</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Rainfall</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">6h</p>
                          <p className="font-mono">{selectedTile.rainfall6h}mm</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">24h</p>
                          <p className="font-mono">{selectedTile.rainfall24h}mm</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">72h</p>
                          <p className="font-mono">{selectedTile.rainfall72h}mm</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Explanation</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{selectedTile.explanation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="panel flex flex-col items-center justify-center py-12 text-center">
                  <Grid3X3 className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Click a tile on the grid to inspect its details</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ─── Generate Tab ─── */}
        {can("tiles.generate") && (
          <TabsContent value="generate" className="mt-4">
            <div className="max-w-lg space-y-5">
              <div className="panel space-y-4">
                <h2 className="text-sm font-semibold">Generate Tiles</h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>City or area</Label>
                    <Select value={genCity} onValueChange={setGenCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="makoko">Makoko</SelectItem>
                        <SelectItem value="ajegunle">Ajegunle</SelectItem>
                        <SelectItem value="lekki">Lekki Phase 1</SelectItem>
                        <SelectItem value="victoria">Victoria Island</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bbox">Bounding box (optional override)</Label>
                    <Input
                      id="bbox"
                      placeholder="minLon, minLat, maxLon, maxLat"
                      value={genBbox}
                      onChange={(e) => setGenBbox(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty to use the area's polygon bounding box</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tile size (metres)</Label>
                    <Select value={genSize} onValueChange={setGenSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                      <>
                        <Play className="h-4 w-4" />
                        Generate Tiles
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {genResult !== null && (
                <div className="panel border-status-active/30 bg-status-active/5 flex items-center gap-3">
                  <Grid3X3 className="h-5 w-5 text-status-active" />
                  <div>
                    <p className="text-sm font-medium">{genResult} tiles generated successfully</p>
                    <p className="text-xs text-muted-foreground">
                      Switch to the Visualise tab to inspect the grid.
                    </p>
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
