import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, MapPin, CheckCircle2 } from "lucide-react";
import { areaApi } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

interface SearchResult {
  id: string; // external_id from backend
  displayName: string;
  source: string;
  bbox: [number, number, number, number];
  confidence?: number;
  geometry?: Record<string, unknown> | null;
}

type Step = "search" | "confirm";

export function AreaImportWizard({ onComplete }: Props) {
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [sourcePreference, setSourcePreference] = useState("any");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable metadata for confirm step
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editPopulation, setEditPopulation] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await areaApi.importSearch({
        name: query,
        city: city || undefined,
        source_preference: sourcePreference !== "any" ? sourcePreference : undefined,
      });
      const mapped: SearchResult[] = (res.data ?? []).map((c) => ({
        id: c.external_id,
        displayName: c.display_name,
        source: c.source,
        bbox: c.bounding_box ?? [0, 0, 0, 0],
        geometry: c.geometry,
      }));
      setResults(mapped);
      if (mapped.length === 0) toast.info("No results found. Try a different query.");
    } catch (err) {
      toast.error((err as Error).message ?? "Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setSelected(result);
    // Pre-fill editable metadata
    const parts = result.displayName.split(",").map((s) => s.trim());
    setEditName(parts[0] || "");
    setEditCity(parts[1] || city);
    setEditCountry(parts[2] || country);
    setStep("confirm");
  };

  const handleSave = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await areaApi.importConfirm({
        name: editName,
        city: editCity || undefined,
        country: editCountry || undefined,
        source: selected.source,
        external_id: selected.id,
        geometry: selected.geometry ?? {},
        source_query: query,
      });
      toast.success("Area imported successfully.");
      onComplete();
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to save area.");
    } finally {
      setIsSaving(false);
    }
  };

  if (step === "confirm" && selected) {
    return (
      <div className="space-y-5">
        {/* Map preview placeholder */}
        <div className="rounded-md border border-border bg-muted/50 h-48 flex items-center justify-center">
          <div className="text-center text-muted-foreground text-sm">
            <MapPin className="h-6 w-6 mx-auto mb-1" />
            Polygon preview
            <div className="text-xs font-mono mt-1">
              bbox: [{selected.bbox.join(", ")}]
            </div>
          </div>
        </div>

        {/* Editable metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="areaName">Area name</Label>
            <Input id="areaName" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="areaCity">City</Label>
            <Input id="areaCity" value={editCity} onChange={(e) => setEditCity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="areaCountry">Country</Label>
            <Input id="areaCountry" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="areaPop">Population (est.)</Label>
            <Input id="areaPop" value={editPopulation} onChange={(e) => setEditPopulation(e.target.value)} placeholder="Optional" />
          </div>
        </div>

        {/* Provenance (read-only) */}
        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Provenance</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">Source</span>
            <span className="font-medium capitalize">{selected.source}</span>
            <span className="text-muted-foreground">External ID</span>
            <span className="font-mono text-xs">{selected.id}</span>
            <span className="text-muted-foreground">Query</span>
            <span className="text-xs">{query}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep("search")}>
            Back to results
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !editName}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save Area
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="searchQuery">Area name</Label>
          <Input
            id="searchQuery"
            placeholder="e.g. Makoko"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="searchCity">City</Label>
            <Input id="searchCity" placeholder="Lagos" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Source preference</Label>
            <Select value={sourcePreference} onValueChange={setSourcePreference}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any source</SelectItem>
                <SelectItem value="nominatim">Nominatim first</SelectItem>
                <SelectItem value="overpass">Overpass first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSearching || !query.trim()}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <>
              <Search className="h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {results.length} results found
          </p>
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full text-left rounded-md border border-border bg-card p-3 hover:border-primary/50 hover:bg-muted/30 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{r.displayName}</span>
                </div>
                <span className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  r.source === "nominatim"
                    ? "bg-severity-info/15 text-severity-info border-severity-info/30"
                    : "bg-accent/15 text-accent border-accent/30"
                }`}>
                  {r.source}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">bbox: [{r.bbox.map((v) => v.toFixed(2)).join(", ")}]</span>
                {r.confidence != null && (
                  <span>Confidence: {(r.confidence * 100).toFixed(0)}%</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
