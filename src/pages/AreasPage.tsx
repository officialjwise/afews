import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Plus, Search, Globe, FileJson, ExternalLink, Loader2 } from "lucide-react";
import { AreaImportWizard } from "@/components/areas/AreaImportWizard";
import { GeoJsonUpload } from "@/components/areas/GeoJsonUpload";
import { toast } from "sonner";
import { areaApi, riskApi, type AreaRecord, type AreaRiskItem } from "@/lib/api";

type RiskLevel = "severe" | "high" | "moderate" | "low";
const riskBadgeVariant: Record<RiskLevel, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

function riskLevelDisplay(rl: string): RiskLevel {
  const m: Record<string, RiskLevel> = { SEVERE: "severe", HIGH: "high", MODERATE: "moderate", LOW: "low" };
  return m[rl.toUpperCase()] ?? "low";
}

function sourceBadgeClass(source?: string | null) {
  const s = (source ?? "").toLowerCase();
  if (s.includes("nominatim")) return "bg-severity-info/15 text-severity-info border-severity-info/30";
  if (s.includes("overpass")) return "bg-accent/15 text-accent border-accent/30";
  return "bg-muted text-muted-foreground border-border";
}

export default function AreasPage() {
  const { can, role } = useAuth();
  const [areas, setAreas]         = useState<AreaRecord[]>([]);
  const [riskMap, setRiskMap]     = useState<Record<string, AreaRiskItem>>({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [areasRes, riskRes] = await Promise.all([areaApi.list(), riskApi.overview()]);
        if (cancelled) return;
        setAreas(areasRes.data);
        const rm: Record<string, AreaRiskItem> = {};
        riskRes.data.items.forEach(r => { rm[r.area_id] = r; });
        setRiskMap(rm);
      } catch {
        toast.error("Failed to load areas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = areas.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Areas & Boundaries</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage neighbourhood polygons and modelling grid cells
          </p>
        </div>
        {can("areas.manage") && (
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Area
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Area</DialogTitle>
                <DialogDescription>
                  Import from OpenStreetMap or upload GeoJSON manually
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="import" className="mt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="import" className="flex-1 gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    Import from Dataset
                  </TabsTrigger>
                  <TabsTrigger value="geojson" className="flex-1 gap-1.5">
                    <FileJson className="h-3.5 w-3.5" />
                    Upload GeoJSON
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="import" className="mt-4">
                  <AreaImportWizard onComplete={() => { setImportOpen(false); toast.success("Area imported successfully"); }} />
                </TabsContent>
                <TabsContent value="geojson" className="mt-4">
                  <GeoJsonUpload onComplete={() => { setImportOpen(false); toast.success("GeoJSON uploaded successfully"); }} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search areas…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="panel p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Tiles</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((area) => {
              const risk = riskMap[area.id];
              const rl = risk ? riskLevelDisplay(risk.risk_level) : null;
              return (
                <TableRow key={area.id} className="cursor-pointer hover:bg-muted/40">
                  <TableCell>
                    <Link to={`/${role}/areas/${area.id}`} className="flex items-center gap-2 font-medium hover:text-primary transition-colors">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {area.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{area.city}</TableCell>
                  <TableCell>
                    {area.source ? (
                      <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${sourceBadgeClass(area.source)}`}>
                        {area.source}
                      </span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{risk?.tile_count ?? "—"}</TableCell>
                  <TableCell>
                    {rl ? <Badge variant={riskBadgeVariant[rl]}>{rl}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    <Link to={`/${role}/areas/${area.id}`}>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {search ? `No areas found matching "${search}"` : "No areas yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </div>
    </div>
  );
}
