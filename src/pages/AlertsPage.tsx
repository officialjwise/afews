import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Bell, Plus, Send, CheckCircle2, XCircle, Clock, Loader2, MapPin, Users, AlertTriangle, MessageSquare,
} from "lucide-react";

type AlertStatus = "draft" | "approved" | "rejected" | "sent";
type RiskLevel = "low" | "moderate" | "high" | "severe";

interface FloodAlert {
  id: string; title: string; area: string; riskLevel: RiskLevel; horizon: string;
  status: AlertStatus; message: string; createdBy: string; createdByRole: string;
  createdAt: string; recipientCount: number; rejectionReason?: string;
  delivery?: { sent: number; failed: number; pending: number; channel: string };
}

const INITIAL_ALERTS: FloodAlert[] = [
  { id: "al1", title: "Severe flooding expected in Alajo", area: "Alajo", riskLevel: "severe", horizon: "72h", status: "approved", message: "Heavy rainfall expected over the next 72 hours along the Odaw River. Evacuate to higher ground immediately.", createdBy: "Kofi Boateng", createdByRole: "coordinator", createdAt: "2h ago", recipientCount: 1240 },
  { id: "al2", title: "High flood risk warning for Nima", area: "Nima", riskLevel: "high", horizon: "24h", status: "draft", message: "Sustained rainfall increasing flood risk. Prepare emergency supplies and monitor updates.", createdBy: "Kwame Asante", createdByRole: "admin", createdAt: "4h ago", recipientCount: 890 },
  { id: "al3", title: "Moderate risk advisory — Adabraka", area: "Adabraka", riskLevel: "moderate", horizon: "24h", status: "sent", message: "Moderate flood risk detected. Avoid low-lying roads during peak rainfall.", createdBy: "Kwame Asante", createdByRole: "admin", createdAt: "1d ago", recipientCount: 2100, delivery: { sent: 1980, failed: 42, pending: 78, channel: "SMS" } },
  { id: "al4", title: "Flash flood alert for Osu", area: "Osu", riskLevel: "high", horizon: "6h", status: "rejected", message: "Potential flash flooding in coastal zones.", createdBy: "Kofi Boateng", createdByRole: "coordinator", createdAt: "2d ago", recipientCount: 1560, rejectionReason: "Risk score has since decreased. Re-evaluate before resubmitting." },
  { id: "al5", title: "Low-level monitoring — Kaneshie", area: "Kaneshie", riskLevel: "low", horizon: "6h", status: "draft", message: "Low-level flood monitoring active. No immediate action required.", createdBy: "Kofi Boateng", createdByRole: "coordinator", createdAt: "3h ago", recipientCount: 720 },
];

const statusConfig: Record<AlertStatus, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: "Draft", icon: Clock, className: "bg-muted text-muted-foreground" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-status-active/15 text-status-active" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-severity-critical/15 text-severity-critical" },
  sent: { label: "Sent", icon: Send, className: "bg-severity-info/15 text-severity-info" },
};

const riskBadgeVariant: Record<RiskLevel, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

const GH_AREAS = ["Alajo", "Nima", "Adabraka", "Osu", "Kaneshie", "Odawna", "Ashaiman", "Ablekuma"];

export default function AlertsPage() {
  const { role, can } = useAuth();
  const [alerts, setAlerts] = useState<FloodAlert[]>(INITIAL_ALERTS);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDraftForm, setShowDraftForm] = useState(false);
  const [sendConfirm, setSendConfirm] = useState<FloodAlert | null>(null);
  const [rejectDialog, setRejectDialog] = useState<FloodAlert | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<FloodAlert | null>(null);

  const [draftArea, setDraftArea] = useState("");
  const [draftHorizon, setDraftHorizon] = useState("");
  const [draftLevel, setDraftLevel] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMessage, setDraftMessage] = useState("");

  let visibleAlerts = alerts;
  if (role === "coordinator") visibleAlerts = alerts.filter((a) => a.createdByRole === "coordinator");
  if (statusFilter !== "all") visibleAlerts = visibleAlerts.filter((a) => a.status === statusFilter);

  const canDraft = can("alerts.draft");
  const canReview = can("alerts.review");
  const canDispatch = can("alerts.dispatch");

  const handleApprove = (alert: FloodAlert) => {
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: "approved" as AlertStatus } : a));
    setSelectedAlert(prev => prev?.id === alert.id ? { ...prev, status: "approved" } : prev);
    toast.success(`Alert "${alert.title}" approved`);
  };

  const handleReject = () => {
    if (!rejectDialog) return;
    setAlerts(prev => prev.map(a => a.id === rejectDialog.id ? { ...a, status: "rejected" as AlertStatus, rejectionReason: rejectReason } : a));
    toast.error(`Alert "${rejectDialog.title}" rejected`);
    setRejectDialog(null);
    setRejectReason("");
  };

  const handleSend = () => {
    if (!sendConfirm) return;
    setAlerts(prev => prev.map(a => a.id === sendConfirm.id ? { ...a, status: "sent" as AlertStatus, delivery: { sent: a.recipientCount - 18, failed: 18, pending: 0, channel: "SMS + WhatsApp" } } : a));
    toast.success(`Alert dispatched to ${sendConfirm.recipientCount.toLocaleString()} recipients`);
    setSendConfirm(null);
  };

  const handleDraftSave = () => {
    const newAlert: FloodAlert = {
      id: `al-${Date.now()}`, title: draftTitle, area: draftArea, riskLevel: draftLevel as RiskLevel,
      horizon: draftHorizon, status: "draft", message: draftMessage, createdBy: "You",
      createdByRole: role, createdAt: "Just now", recipientCount: Math.floor(Math.random() * 2000) + 500,
    };
    setAlerts(prev => [newAlert, ...prev]);
    setShowDraftForm(false);
    setDraftArea(""); setDraftHorizon(""); setDraftLevel(""); setDraftTitle(""); setDraftMessage("");
    toast.success("Draft alert created");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {role === "stakeholder" ? "Review, approve, or reject draft alerts" :
             role === "coordinator" ? "Your draft alerts and active warnings" :
             "Draft, review, approve, and dispatch flood alerts"}
          </p>
        </div>
        {canDraft && (
          <Button onClick={() => setShowDraftForm(true)}>
            <Plus className="h-4 w-4" /> Draft Alert
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {["all", "draft", "approved", "rejected", "sent"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors border ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          {visibleAlerts.length === 0 && (
            <div className="panel flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No alerts match the current filter</p>
            </div>
          )}
          {visibleAlerts.map((alert) => {
            const StatusIcon = statusConfig[alert.status].icon;
            return (
              <button
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`w-full text-left panel hover:border-primary/30 transition-colors ${
                  selectedAlert?.id === alert.id ? "border-primary/50 bg-muted/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{alert.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {alert.area}</span>
                      <span>{alert.horizon}</span>
                      <span>by {alert.createdBy}</span>
                      <span>{alert.createdAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={riskBadgeVariant[alert.riskLevel]}>{alert.riskLevel}</Badge>
                    <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${statusConfig[alert.status].className}`}>
                      <StatusIcon className="h-3 w-3" /> {statusConfig[alert.status].label}
                    </span>
                  </div>
                </div>
                {canDispatch && alert.status === "approved" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <Button size="sm" onClick={(e) => { e.stopPropagation(); setSendConfirm(alert); }} className="gap-1.5">
                      <Send className="h-3.5 w-3.5" /> Send Alert
                    </Button>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div>
          {selectedAlert ? (
            <div className="panel space-y-4 sticky top-6 animate-fade-in">
              <h3 className="text-sm font-semibold">{selectedAlert.title}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="metric-label">Area</p><p className="font-medium">{selectedAlert.area}</p></div>
                <div><p className="metric-label">Horizon</p><p className="font-medium">{selectedAlert.horizon}</p></div>
                <div><p className="metric-label">Risk Level</p><Badge variant={riskBadgeVariant[selectedAlert.riskLevel]}>{selectedAlert.riskLevel}</Badge></div>
                <div><p className="metric-label">Recipients</p><p className="font-medium flex items-center gap-1"><Users className="h-3 w-3 text-muted-foreground" />{selectedAlert.recipientCount.toLocaleString()}</p></div>
              </div>
              <div><p className="metric-label mb-1">Message</p><p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-sm p-2.5">{selectedAlert.message}</p></div>
              {selectedAlert.rejectionReason && (
                <div><p className="metric-label mb-1">Rejection Reason</p><p className="text-sm text-severity-critical/80 bg-severity-critical/5 rounded-sm p-2.5 border border-severity-critical/20">{selectedAlert.rejectionReason}</p></div>
              )}
              {selectedAlert.delivery && (
                <div>
                  <p className="metric-label mb-2">Delivery</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-sm bg-status-active/10"><p className="text-lg font-semibold text-status-active">{selectedAlert.delivery.sent}</p><p className="text-[10px] text-muted-foreground">Sent</p></div>
                    <div className="text-center p-2 rounded-sm bg-severity-critical/10"><p className="text-lg font-semibold text-severity-critical">{selectedAlert.delivery.failed}</p><p className="text-[10px] text-muted-foreground">Failed</p></div>
                    <div className="text-center p-2 rounded-sm bg-status-pending/10"><p className="text-lg font-semibold text-status-pending">{selectedAlert.delivery.pending}</p><p className="text-[10px] text-muted-foreground">Pending</p></div>
                  </div>
                </div>
              )}
              {canReview && selectedAlert.status === "draft" && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button size="sm" className="flex-1" onClick={() => handleApprove(selectedAlert)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-severity-critical hover:text-severity-critical" onClick={() => setRejectDialog(selectedAlert)}>
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              )}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <p>Created by {selectedAlert.createdBy} ({selectedAlert.createdByRole})</p>
                <p>{selectedAlert.createdAt}</p>
              </div>
            </div>
          ) : (
            <div className="panel flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Select an alert to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Draft Form Dialog */}
      <Dialog open={showDraftForm} onOpenChange={setShowDraftForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Draft New Alert</DialogTitle>
            <DialogDescription>Create a flood alert for review and approval</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Target area</Label>
              <Select value={draftArea} onValueChange={setDraftArea}>
                <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                <SelectContent>
                  {GH_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Forecast horizon</Label>
                <Select value={draftHorizon} onValueChange={setDraftHorizon}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6h">6 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="72h">72 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Risk level</Label>
                <Select value={draftLevel} onValueChange={setDraftLevel}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Alert title</Label>
              <Input placeholder="Brief, clear title" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value.slice(0, 255))} />
              <p className="text-xs text-muted-foreground text-right">{draftTitle.length}/255</p>
            </div>
            <div className="space-y-1.5">
              <Label>Message body</Label>
              <Textarea rows={4} placeholder="Describe the flood risk and recommended actions…" value={draftMessage} onChange={(e) => setDraftMessage(e.target.value.slice(0, 2000))} />
              <p className="text-xs text-muted-foreground text-right">{draftMessage.length}/2000</p>
            </div>
            {draftArea && (
              <div className="rounded-sm bg-muted/50 p-2.5 text-xs text-muted-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> Estimated recipients: <span className="font-medium text-foreground">~1,240</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDraftForm(false)}>Cancel</Button>
            <Button disabled={!draftArea || !draftHorizon || !draftLevel || !draftTitle || !draftMessage} onClick={handleDraftSave}>
              Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation */}
      <Dialog open={!!sendConfirm} onOpenChange={() => setSendConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Alert Dispatch</DialogTitle>
            <DialogDescription>This will send the alert to all subscribers in the target area.</DialogDescription>
          </DialogHeader>
          {sendConfirm && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-muted-foreground text-xs">Area</p><p className="font-medium">{sendConfirm.area}</p></div>
                <div><p className="text-muted-foreground text-xs">Recipients</p><p className="font-medium">{sendConfirm.recipientCount.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground text-xs">Channel</p><p className="font-medium">SMS + WhatsApp</p></div>
                <div><p className="text-muted-foreground text-xs">Risk Level</p><Badge variant={riskBadgeVariant[sendConfirm.riskLevel]}>{sendConfirm.riskLevel}</Badge></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendConfirm(null)}>Cancel</Button>
            <Button onClick={handleSend}><Send className="h-4 w-4" /> Send Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Alert</DialogTitle>
            <DialogDescription>Provide a reason for rejection (min. 5 characters).</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder="Reason for rejection…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason(""); }}>Cancel</Button>
            <Button variant="destructive" disabled={rejectReason.length < 5} onClick={handleReject}>Reject Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
