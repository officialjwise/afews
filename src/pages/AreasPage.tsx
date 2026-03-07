import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Plus, Search, Upload, Globe, FileJson, ExternalLink } from "lucide-react";
import { AreaImportWizard } from "@/components/areas/AreaImportWizard";
import { GeoJsonUpload } from "@/components/areas/GeoJsonUpload";

/* ─── Mock data ─── */
const MOCK_AREAS = [
  { id: "a1", name: "Makoko", city: "Lagos", country: "Nigeria", source: "nominatim" as const, tiles: 48, subscribers: 1240, riskLevel: "severe" as const },
  { id: "a2", name: "Ajegunle", city: "Lagos", country: "Nigeria", source: "overpass" as const, tiles: 36, subscribers: 890, riskLevel: "high" as const },
  { id: "a3", name: "Lekki Phase 1", city: "Lagos", country: "Nigeria", source: "nominatim" as const, tiles: 52, subscribers: 2100, riskLevel: "moderate" as const },
  { id: "a4", name: "Victoria Island", city: "Lagos", country: "Nigeria", source: "manual" as const, tiles: 44, subscribers: 1560, riskLevel: "moderate" as const },
  { id: "a5", name: "Surulere", city: "Lagos", country: "Nigeria", source: "nominatim" as const, tiles: 40, subscribers: 720, riskLevel: "low" as const },
  { id: "a6", name: "Ikoyi", city: "Lagos", country: "Nigeria", source: "overpass" as const, tiles: 44, subscribers: 1560, riskLevel: "moderate" as const },
];

type RiskLevel = "severe" | "high" | "moderate" | "low";

const riskBadgeVariant: Record<RiskLevel, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical",
  high: "high",
  moderate: "moderate",
  low: "low",
};

const sourceBadge: Record<string, { label: string; className: string }> = {
  nominatim: { label: "Nominatim", className: "bg-severity-info/15 text-severity-info border-severity-info/30" },
  overpass: { label: "Overpass", className: "bg-accent/15 text-accent border-accent/30" },
  manual: { label: "Manual", className: "bg-muted text-muted-foreground border-border" },
};

export default function AreasPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const filtered = MOCK_AREAS.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Areas & Tiles</h1>
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
                  <AreaImportWizard onComplete={() => setImportOpen(false)} />
                </TabsContent>
                <TabsContent value="geojson" className="mt-4">
                  <GeoJsonUpload onComplete={() => setImportOpen(false)} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search areas…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Area table */}
      <div className="panel p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Tiles</TableHead>
              <TableHead className="text-right">Subscribers</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((area) => (
              <TableRow key={area.id} className="cursor-pointer hover:bg-muted/40">
                <TableCell>
                  <Link to={`/areas/${area.id}`} className="flex items-center gap-2 font-medium hover:text-primary transition-colors">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {area.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{area.city}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${sourceBadge[area.source].className}`}>
                    {sourceBadge[area.source].label}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{area.tiles}</TableCell>
                <TableCell className="text-right font-mono text-sm">{area.subscribers.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={riskBadgeVariant[area.riskLevel]}>{area.riskLevel}</Badge>
                </TableCell>
                <TableCell>
                  <Link to={`/areas/${area.id}`}>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No areas found matching "{search}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
