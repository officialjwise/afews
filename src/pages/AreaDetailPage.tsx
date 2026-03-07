import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Grid3X3, Users, Activity, ArrowLeft, Pencil } from "lucide-react";

const AREA = {
  id: "a1", name: "Alajo", uuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  city: "Accra", country: "Ghana", source: "nominatim" as const,
  externalId: "OSM-REL-45678", query: "Alajo, Accra, Ghana",
  tiles: 48, subscribers: 1240, riskScore: 0.92, riskLevel: "severe" as const,
};

const sourceBadge: Record<string, { label: string; className: string }> = {
  nominatim: { label: "Nominatim", className: "bg-severity-info/15 text-severity-info border-severity-info/30" },
  overpass: { label: "Overpass", className: "bg-accent/15 text-accent border-accent/30" },
  manual: { label: "Manual / Fallback", className: "bg-muted text-muted-foreground border-border" },
};

export default function AreaDetailPage() {
  const { id } = useParams();
  const { can, role } = useAuth();
  const area = AREA;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to={`/${role}/areas`} className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Areas
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{area.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{area.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {area.city}, {area.country} · <span className="font-mono text-xs">{area.uuid}</span>
          </p>
        </div>
        {can("areas.manage") && (
          <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-md border border-border bg-muted/50 h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground text-sm">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              Area polygon map preview
            </div>
          </div>
          <div className="panel space-y-3">
            <h2 className="section-header">Source & Provenance</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <span className="text-muted-foreground">Source</span>
              <span><span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${sourceBadge[area.source].className}`}>{sourceBadge[area.source].label}</span></span>
              <span className="text-muted-foreground">External ID</span>
              <span className="font-mono text-xs">{area.externalId}</span>
              <span className="text-muted-foreground">Source Query</span>
              <span className="text-xs">{area.query}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel space-y-3">
            <h2 className="section-header">Current Risk</h2>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold font-mono ${
                area.riskScore >= 0.8 ? "text-severity-critical" : area.riskScore >= 0.6 ? "text-severity-high" : "text-severity-moderate"
              }`}>{(area.riskScore * 100).toFixed(0)}%</span>
              <Badge variant="critical">{area.riskLevel}</Badge>
            </div>
          </div>
          <div className="panel space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Grid3X3 className="h-3.5 w-3.5" /> Tiles</span>
              <span className="text-sm font-medium text-primary">{area.tiles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-3.5 w-3.5" /> Subscribers</span>
              <span className="text-sm font-medium">{area.subscribers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Activity className="h-3.5 w-3.5" /> Risk Engine</span>
              <span className="text-xs text-status-active font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
