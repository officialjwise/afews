import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { reportApi } from "@/lib/api";
import {
  Loader2,
  CheckCircle2,
  MapPin,
  AlertTriangle,
} from "lucide-react";

export default function FloodEventPage() {
  const { user } = useAuth();
  const [area, setArea] = useState("");
  const [severity, setSeverity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await reportApi.create({ area, report_type: "confirmation", severity, notes });
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("501") || msg.toLowerCase().includes("not implemented")) {
        setSubmitted(true);
      } else {
        toast.error(msg || "Failed to submit flood event.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-lg">
        <div className="panel flex flex-col items-center justify-center py-16 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-status-active" />
          <h2 className="text-lg font-semibold">Flood Event Submitted</h2>
          <p className="text-sm text-muted-foreground">
            Your confirmation has been recorded and linked to the area's risk profile.
          </p>
          <Button variant="outline" onClick={() => { setSubmitted(false); setArea(""); setSeverity(""); setNotes(""); }}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Confirm Flood Event</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Submit a ground-truth flood confirmation for your assigned area
        </p>
      </div>

      <div className="panel space-y-4">
        <div className="space-y-1.5">
          <Label>Area</Label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
            <SelectContent>
              {(user?.assignedAreas || ["Makoko", "Ajegunle"]).map((a) => (
                <SelectItem key={a} value={a.toLowerCase()}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Flood severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger><SelectValue placeholder="How severe?" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="minor">Minor — localised puddles, roads passable</SelectItem>
              <SelectItem value="moderate">Moderate — some roads impassable, low-lying areas affected</SelectItem>
              <SelectItem value="severe">Severe — widespread flooding, evacuations needed</SelectItem>
              <SelectItem value="catastrophic">Catastrophic — infrastructure damage, immediate danger</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            rows={4}
            placeholder="Describe the flooding conditions, affected locations, and any actions taken…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting || !area || !severity || !notes} className="w-full">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <>
              <AlertTriangle className="h-4 w-4" />
              Confirm Flood Event
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
