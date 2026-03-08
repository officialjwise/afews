import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Grid3X3, Users, Activity, ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { areaApi, riskApi, type AreaRecord, type AreaRiskItem } from "@/lib/api";

const sourceBadge: Record<string, { label: string; className: string }> = {
  nominatim: { label: "Nominatim", className: "bg-severity-info/15 text-severity-info border-severity-info/30" },
  overpass: { label: "Overpass", className: "bg-accent/15 text-accent border-accent/30" },
  chirps: { label: "CHIRPS", className: "bg-accent/15 text-accent border-accent/30" },
  copernicus_dem: { label: "Copernicus DEM", className: "bg-accent/15 text-accent border-accent/30" },
  open_meteo: { label: "Open-Meteo", className: "bg-severity-info/15 text-severity-info border-severity-info/30" },
};

function getSourceBadge(source?: string | null) {
  const key = (source ?? "").toLowerCase();
  return sourceBadge[key] ?? { label: source ?? "—", className: "bg-muted text-muted-foreground border-border" };
}

export default function AreaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { can, role } = useAuth();
  const [area, setArea]   = useState<AreaRecord | null>(null);
  const [risk, setRisk]   = useState<AreaRiskItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [areaRes, riskRes] = await Promise.all([areaApi.get(id), riskApi.overview()]);
        if (cancelled) return;
        setArea(areaRes.data);
        const match = riskRes.data.items.find(r => r.area_id === id) ?? null;
        setRisk(match);
      } catch {
        // area will be null, handle in JSX
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!area) return <div className="p-6 text-muted-foreground">Area not found.</div>;

  const riskScore = risk?.aggregated_score ?? null;
  const riskLevelRaw = risk?.risk_level ?? null;
  const riskLevelDisplay = riskLevelRaw ? riskLevelRaw.toLowerCase() : null;
  const riskVariant = ({ SEVERE: "critical", HIGH: "high", MODERATE: "moderate", LOW: "low" } as Record<string, "critical"|"high"|"moderate"|"low">)[riskLevelRaw ?? ""] ?? "low";
  const sb = getSourceBadge(area.source);

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
            {area.city}, {area.country} · <span className="font-mono text-xs">{area.id}</span>
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
              <span><span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${sb.className}`}>{sb.label}</span></span>
              <span className="text-muted-foreground">External ID</span>
              <span className="font-mono text-xs">{area.source_external_id ?? "—"}</span>
              <span className="text-muted-foreground">Source Query</span>
              <span className="text-xs">{area.source_query ?? "—"}</span>
              <span className="text-muted-foreground">Created</span>
              <span className="text-xs">{new Date(area.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel space-y-3">
            <h2 className="section-header">Current Risk</h2>
            {riskScore !== null ? (
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold font-mono ${
                  riskScore >= 0.8 ? "text-severity-critical" : riskScore >= 0.6 ? "text-severity-high" : "text-severity-moderate"
                }`}>{(riskScore * 100).toFixed(0)}%</span>
                {riskLevelDisplay && <Badge variant={riskVariant}>{riskLevelDisplay}</Badge>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No risk data yet.</p>
            )}
          </div>
          <div className="panel space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Grid3X3 className="h-3.5 w-3.5" /> Tiles</span>
              <span className="text-sm font-medium text-primary">{risk?.tile_count ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-3.5 w-3.5" /> Subscribers</span>
              <span className="text-sm font-medium text-muted-foreground">—</span>
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
