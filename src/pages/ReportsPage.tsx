import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClipboardList,
  Plus,
  MapPin,
  Camera,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";

/* ─── Types & mock data ─── */
interface FieldReport {
  id: string;
  area: string;
  type: "observation" | "confirmation" | "damage_assessment";
  severity: string;
  notes: string;
  createdAt: string;
  hasPhoto: boolean;
}

const MOCK_REPORTS: FieldReport[] = [
  { id: "fr1", area: "Makoko", type: "observation", severity: "high", notes: "Water level rising rapidly near the main access road. Approximately 30cm above normal.", createdAt: "45 min ago", hasPhoto: true },
  { id: "fr2", area: "Ajegunle", type: "confirmation", severity: "severe", notes: "Flooding confirmed in Zone B. Several households evacuated. Emergency services notified.", createdAt: "2h ago", hasPhoto: true },
  { id: "fr3", area: "Makoko", type: "damage_assessment", severity: "moderate", notes: "Post-flood damage assessment: 12 structures with minor water damage, roads passable.", createdAt: "1d ago", hasPhoto: false },
];

const typeLabels: Record<string, string> = {
  observation: "Observation",
  confirmation: "Flood Confirmation",
  damage_assessment: "Damage Assessment",
};

const severityVariant: Record<string, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [area, setArea] = useState("");
  const [reportType, setReportType] = useState("");
  const [severity, setSeverity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // TODO: POST report
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setShowForm(false);
    setArea("");
    setReportType("");
    setSeverity("");
    setNotes("");
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Field Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submit observations, flood confirmations, and damage assessments
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {MOCK_REPORTS.map((report) => (
          <div key={report.id} className="panel space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{typeLabels[report.type]}</span>
                  <Badge variant={severityVariant[report.severity]}>{report.severity}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {report.area}
                  <span>·</span>
                  <Clock className="h-3 w-3" /> {report.createdAt}
                  {report.hasPhoto && (
                    <>
                      <span>·</span>
                      <Camera className="h-3 w-3" /> Photo attached
                    </>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{report.notes}</p>
          </div>
        ))}
      </div>

      {/* ─── New Report Dialog ─── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Field Report</DialogTitle>
            <DialogDescription>Record an observation, confirmation, or damage assessment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
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
              <Label>Report type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="observation">Observation</SelectItem>
                  <SelectItem value="confirmation">Flood Confirmation</SelectItem>
                  <SelectItem value="damage_assessment">Damage Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Severity level</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={4} placeholder="Describe what you observed…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block">Photo (optional)</Label>
              <div className="rounded-md border-2 border-dashed border-border p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Camera className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Click to upload a photo</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !area || !reportType || !severity || !notes}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
