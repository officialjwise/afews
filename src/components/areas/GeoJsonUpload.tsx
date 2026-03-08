import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileJson, CheckCircle2, Loader2, AlertTriangle, MapPin } from "lucide-react";
import { areaApi } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

export function GeoJsonUpload({ onComplete }: Props) {
  const [rawJson, setRawJson] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const validate = useCallback((text: string) => {
    setValidationError(null);
    setIsValid(false);
    if (!text.trim()) return;
    try {
      const parsed = JSON.parse(text);
      const geomType = parsed.type || parsed.geometry?.type;
      if (geomType !== "Polygon" && geomType !== "MultiPolygon") {
        setValidationError(`Unsupported geometry type: "${geomType}". Only Polygon or MultiPolygon are accepted.`);
        return;
      }
      const coords = parsed.coordinates || parsed.geometry?.coordinates;
      if (!coords || !Array.isArray(coords)) {
        setValidationError("Missing or invalid coordinates.");
        return;
      }
      setIsValid(true);
    } catch {
      setValidationError("Invalid JSON format.");
    }
  }, []);

  const handleTextChange = (text: string) => {
    setRawJson(text);
    validate(text);
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".json") && !file.name.endsWith(".geojson")) {
        setValidationError("Please upload a .json or .geojson file.");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setRawJson(text);
        validate(text);
      };
      reader.readAsText(file);
    },
    [validate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSave = async () => {
    if (!isValid || !name.trim()) return;
    setIsSaving(true);
    try {
      await areaApi.importGeojson({
        name: name.trim(),
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        geometry: JSON.parse(rawJson) as Record<string, unknown>,
      });
      toast.success("Area imported successfully.");
      onComplete();
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to save area.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-md border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
          isDragging ? "border-primary bg-primary/5" : "border-border"
        }`}
        onClick={() => {
          const el = document.createElement("input");
          el.type = "file";
          el.accept = ".json,.geojson";
          el.onchange = () => {
            if (el.files?.[0]) handleFile(el.files[0]);
          };
          el.click();
        }}
      >
        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">
          {fileName ? fileName : "Drop a GeoJSON file here or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          .json or .geojson · Polygon or MultiPolygon only
        </p>
      </div>

      {/* Or paste */}
      <div className="space-y-1.5">
        <Label>Or paste GeoJSON</Label>
        <Textarea
          rows={6}
          placeholder='{"type":"Polygon","coordinates":[...]}'
          value={rawJson}
          onChange={(e) => handleTextChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>

      {/* Validation feedback */}
      {validationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {isValid && (
        <>
          {/* Map preview placeholder */}
          <div className="rounded-md border border-border bg-muted/50 h-36 flex items-center justify-center">
            <div className="text-center text-muted-foreground text-sm">
              <MapPin className="h-5 w-5 mx-auto mb-1" />
              Polygon preview
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="manName">Area name *</Label>
              <Input id="manName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Makoko" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manCity">City</Label>
              <Input id="manCity" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manCountry">Country</Label>
              <Input id="manCountry" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
            <FileJson className="h-3.5 w-3.5" />
            Source will be recorded as <span className="font-medium text-foreground">Manual / Fallback</span>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={isSaving || !name.trim()}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save Area
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
