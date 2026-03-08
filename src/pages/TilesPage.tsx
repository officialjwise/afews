import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { HelpTooltip } from "@/components/shared/HelpTooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Grid3X3, Play, Loader2, X, MapPin, Expand } from "lucide-react";
import { toast } from "sonner";
import { areaApi, AreaRecord, TileRecord } from "@/lib/api";

// Tile size (metres) → resolution in decimal degrees
const SIZE_TO_DEG: Record<string, number> = {
  "50": 0.00045,
  "100": 0.0009,
  "250": 0.00225,
  "500": 0.0045,
};

/** Parse "POINT(lon lat)" WKT → [lon, lat] */
function parseCentroid(wkt?: string | null): [number, number] | null {
  if (!wkt) return null;
  const m = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!m) return null;
  return [parseFloat(m[1]), parseFloat(m[2])];
}

export default function TilesPage() {
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState("visualise");

  // Shared area list
  const [areas, setAreas] = useState<AreaRecord[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);

  // Visualise tab
  const [vizAreaId, setVizAreaId] = useState<string>("");
  const [tiles, setTiles] = useState<TileRecord[]>([]);
  const [tilesLoading, setTilesLoading] = useState(false);
  const [selectedTile, setSelectedTile] = useState<TileRecord | null>(null);

  // Generate tab
  const [genAreaId, setGenAreaId] = useState<string>("");
  const [genSize, setGenSize] = useState("100");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genResult, setGenResult] = useState<number | null>(null);

  // Load areas once
  useEffect(() => {
    areaApi.list()
      .then((res) => setAreas(res.data?.items ?? []))
      .catch(() => toast.error("Failed to load areas."))
      .finally(() => setAreasLoading(false));
  }, []);

  // Load tiles when area changes
  useEffect(() => {
    if (!vizAreaId) { setTiles([]); return; }
    setTilesLoading(true);
    setSelectedTile(null);
    areaApi.getTiles(vizAreaId)
      .then((res) => setTiles(res.data?.tiles ?? []))
      .catch(() => toast.error("Failed to load tiles."))
      .finally(() => setTilesLoading(false));
  }, [vizAreaId]);

  const handleGenerate = async () => {
    if (!genAreaId) { toast.error("Select an area first."); return; }
    setIsGenerating(true);
    setGenResult(null);
    try {
      const res = await areaApi.generateTiles(genAreaId, { resolution_deg: SIZE_TO_DEG[genSize] ?? 0.0009 });
      const count = res.data?.tiles_created ?? 0;
      setGenResult(count);
      toast.success(`${count} tiles generated successfully`);
      // Refresh visualise tab if same area is selected
      if (vizAreaId === genAreaId) {
        areaApi.getTiles(vizAreaId).then((r) => setTiles(r.data?.tiles ?? [])).catch(() => {});
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to generate tiles.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Build display grid: sparse 2D map keyed by "row,col"
  const minRow = tiles.length ? Math.min(...tiles.map(t => t.row_idx)) : 0;
  const minCol = tiles.length ? Math.min(...tiles.map(t => t.col_idx)) : 0;
  const maxRow = tiles.length ? Math.max(...tiles.map(t => t.row_idx)) : 0;
  const maxCol = tiles.length ? Math.max(...tiles.map(t => t.col_idx)) : 0;
  const gridRows = maxRow - minRow + 1;
  const gridCols = maxCol - minCol + 1;

  // Sparse lookup: "row_idx,col_idx" → tile
  const tileMap = new Map(tiles.map(t => [`${t.row_idx},${t.col_idx}`, t]));

  // Expand-to-fullscreen state
  const [gridExpanded, setGridExpanded] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Grid3X3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Tile Management</h1>
            <HelpTooltip text="Tiles are small grid cells (e.g. 100m × 100m) used to compute localised flood risk. Each tile has elevation, slope, and rainfall data." />
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

        {/* ── Visualise tab ── */}
        <TabsContent value="visualise" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Label className="text-xs whitespace-nowrap">Select area:</Label>
            <Select value={vizAreaId} onValueChange={setVizAreaId} disabled={areasLoading}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder={areasLoading ? "Loading areas…" : "Choose an area"} />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name} — {a.city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="rounded-md border border-border bg-muted/30 p-4 min-h-[200px] flex flex-col">
                {tilesLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !vizAreaId ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-2 py-8">
                    <Grid3X3 className="h-8 w-8 opacity-40" />
                    <p className="text-sm">Select an area to view its tile grid</p>
                  </div>
                ) : tiles.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-2 py-8">
                    <Grid3X3 className="h-8 w-8 opacity-40" />
                    <p className="text-sm">No tiles found for this area.</p>
                    {can("tiles.generate") && (
                      <p className="text-xs">Use the Generate tab to create tiles.</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{tiles.length}</span> tiles &mdash; {gridRows} rows &times; {gridCols} cols
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 gap-1 text-xs"
                        onClick={() => setGridExpanded(true)}
                      >
                        <Expand className="h-3 w-3" /> Expand
                      </Button>
                    </div>
                    <TileGrid
                      tileMap={tileMap}
                      minRow={minRow}
                      minCol={minCol}
                      gridRows={gridRows}
                      gridCols={gridCols}
                      selectedTile={selectedTile}
                      onSelect={setSelectedTile}
                    />
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="inline-block w-3 h-3 rounded-[2px] bg-primary/20 border border-primary/30" /> Tile cell
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="inline-block w-3 h-3 rounded-[2px] border border-dashed border-border/40" /> Empty position
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="inline-block w-3 h-3 rounded-[2px] ring-1 ring-primary bg-primary/30" /> Selected
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              {selectedTile ? (
                <div className="panel space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Tile Detail</h3>
                    <button onClick={() => setSelectedTile(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Position</p>
                      <p className="font-mono">Row {selectedTile.row_idx}, Col {selectedTile.col_idx}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">City</p>
                      <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedTile.city}</p>
                    </div>
                    {parseCentroid(selectedTile.centroid_wkt) && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Centroid</p>
                        <p className="font-mono text-xs">
                          {parseCentroid(selectedTile.centroid_wkt)![1].toFixed(5)}°N,{" "}
                          {parseCentroid(selectedTile.centroid_wkt)![0].toFixed(5)}°E
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tile ID</p>
                      <p className="font-mono text-[10px] text-muted-foreground break-all">{selectedTile.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Created</p>
                      <p className="text-xs text-muted-foreground">{new Date(selectedTile.created_at).toLocaleString()}</p>
                    </div>
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

        {/* ── Stats tab ── */}
        <TabsContent value="stats" className="mt-4">
          {!vizAreaId ? (
            <p className="text-sm text-muted-foreground">Select an area in the Visualise tab to see statistics.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="panel space-y-1 text-center">
                <p className="metric-label">Total Tiles</p>
                <p className="text-2xl font-bold">{tiles.length}</p>
              </div>
              <div className="panel space-y-1 text-center">
                <p className="metric-label">Grid Rows</p>
                <p className="text-2xl font-bold">{gridRows}</p>
              </div>
              <div className="panel space-y-1 text-center">
                <p className="metric-label">Grid Cols</p>
                <p className="text-2xl font-bold">{gridCols}</p>
              </div>
              <div className="panel space-y-1 text-center">
                <p className="metric-label">Coverage</p>
                <p className="text-2xl font-bold">{(gridRows * gridCols > 0 ? (tiles.length / (gridRows * gridCols) * 100) : 0).toFixed(0)}%</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Generate tab ── */}
        {can("tiles.generate") && (
          <TabsContent value="generate" className="mt-4">
            <div className="max-w-lg space-y-5">
              <div className="panel space-y-4">
                <h2 className="text-sm font-semibold">Generate Tiles for Area</h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Area</Label>
                    <Select value={genAreaId} onValueChange={setGenAreaId} disabled={areasLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={areasLoading ? "Loading areas…" : "Select an area"} />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name} — {a.city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Tiles are generated within the area's boundary polygon.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tile size</Label>
                    <Select value={genSize} onValueChange={setGenSize}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50 m (~0.00045°)</SelectItem>
                        <SelectItem value="100">100 m (~0.0009°)</SelectItem>
                        <SelectItem value="250">250 m (~0.00225°)</SelectItem>
                        <SelectItem value="500">500 m (~0.0045°)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleGenerate} disabled={isGenerating || !genAreaId} className="w-full">
                    {isGenerating
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <><Play className="h-4 w-4 mr-2" /> Generate Tiles</>
                    }
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

      {/* Fullscreen grid dialog */}
      <Dialog open={gridExpanded} onOpenChange={setGridExpanded}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Tile Grid — {tiles.length} tiles ({gridRows} &times; {gridCols})
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[75vh]">
            <TileGrid
              tileMap={tileMap}
              minRow={minRow}
              minCol={minCol}
              gridRows={gridRows}
              gridCols={gridCols}
              selectedTile={selectedTile}
              onSelect={(t) => { setSelectedTile(t); setGridExpanded(false); }}
            />
          </div>
          <div className="flex items-center gap-4 pt-1">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded-[2px] bg-primary/20 border border-primary/30" /> Tile cell
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded-[2px] border border-dashed border-border/40" /> Empty position
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Renders the 2-D grid at correct row/col positions */
function TileGrid({
  tileMap, minRow, minCol, gridRows, gridCols, selectedTile, onSelect,
}: {
  tileMap: Map<string, TileRecord>;
  minRow: number; minCol: number;
  gridRows: number; gridCols: number;
  selectedTile: TileRecord | null;
  onSelect: (t: TileRecord) => void;
}) {
  const CELL = 14; // px per cell
  return (
    <div className="overflow-auto">
      <div
        className="relative"
        style={{ width: gridCols * (CELL + 1), minWidth: "fit-content" }}
      >
        {/* Column index labels every 5 cols */}
        <div className="flex mb-0.5" style={{ paddingLeft: 0 }}>
          {Array.from({ length: gridCols }, (_, cOff) =>
            cOff % 5 === 0 ? (
              <span
                key={cOff}
                className="text-[8px] text-muted-foreground/60 text-center"
                style={{ width: CELL + 1, flexShrink: 0 }}
              >
                {minCol + cOff}
              </span>
            ) : (
              <span key={cOff} style={{ width: CELL + 1, flexShrink: 0 }} />
            )
          )}
        </div>

        {Array.from({ length: gridRows }, (_, rOff) => (
          <div key={rOff} className="flex items-center">
            {/* Row index label every 5 rows */}
            <span
              className="text-[8px] text-muted-foreground/60 shrink-0 text-right pr-0.5"
              style={{ width: 28, visibility: rOff % 5 === 0 ? "visible" : "hidden" }}
            >
              {minRow + rOff}
            </span>
            {Array.from({ length: gridCols }, (_, cOff) => {
              const tile = tileMap.get(`${minRow + rOff},${minCol + cOff}`);
              if (tile) {
                return (
                  <button
                    key={tile.id}
                    onClick={() => onSelect(tile)}
                    title={`Row ${tile.row_idx}, Col ${tile.col_idx}`}
                    style={{ width: CELL, height: CELL, flexShrink: 0, marginRight: 1, marginBottom: 1 }}
                    className={`rounded-[2px] border transition-colors
                      ${selectedTile?.id === tile.id
                        ? "ring-1 ring-primary bg-primary/30 border-primary/50"
                        : "bg-primary/15 border-primary/25 hover:bg-primary/35 hover:border-primary/50"
                      }`}
                  />
                );
              }
              return (
                <div
                  key={`e-${rOff}-${cOff}`}
                  style={{ width: CELL, height: CELL, flexShrink: 0, marginRight: 1, marginBottom: 1 }}
                  className="rounded-[2px] border border-dashed border-border/20"
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
