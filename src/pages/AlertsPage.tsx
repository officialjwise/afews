import { useState, useEffect } from "react";
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
import { alertApi, areaApi, type AlertRecord, type AreaRecord } from "@/lib/api";

type AlertStatus = "draft" | "approved" | "rejected" | "sent";
type RiskLevel = "low" | "moderate" | "high" | "severe";

interface FloodAlert {
  id: string; title: string; area: string; riskLevel: RiskLevel; horizon: string;
  status: AlertStatus; message: string; createdBy: string;
  createdAt: string; rejectionReason?: string;
}

const statusConfig: Record<AlertStatus, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: "Draft", icon: Clock, className: "bg-muted text-muted-foreground" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-status-active/15 text-status-active" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-severity-critical/15 text-severity-critical" },
  sent: { label: "Sent", icon: Send, className: "bg-severity-info/15 text-severity-info" },
};

const riskBadgeVariant: Record<RiskLevel, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

function adaptAlert(r: AlertRecord, areaMap: Record<string, string>): FloodAlert {
  const levelMap: Record<string, RiskLevel> = { SEVERE: "severe", HIGH: "high", MODERATE: "moderate", LOW: "low" };
  const statusMap: Record<string, AlertStatus> = { DRAFT: "draft", APPROVED: "approved", REJECTED: "rejected", SENT: "sent" };
  return {
    id: r.id,
    title: r.title,
    area: areaMap[r.area_id ?? ""] ?? (r.area_id ? `Area ${r.area_id.slice(0, 6)}` : "—"),
    riskLevel: levelMap[r.risk_level] ?? "low",
    horizon: `${r.horizon_h}h`,
    status: statusMap[r.status] ?? "draft",
    message: r.message,
    createdBy: r.created_by.slice(0, 8),
    createdAt: new Date(r.created_at).toLocaleString(),
    rejectionReason: r.rejection_reason ?? undefined,
  };
}

export default function AlertsPage() {
  const { role, can } = useAuth();
  const [alerts, setAlerts]           = useState<FloodAlert[]>([]);
  const [areas, setAreas]             = useState<AreaRecord[]>([]);
  const [areaMap, setAreaMap]         = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDraftForm, setShowDraftForm] = useState(false);
  const [sendConfirm, setSendConfirm] = useState<FloodAlert | null>(null);
  const [rejectDialog, setRejectDialog] = useState<FloodAlert | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<FloodAlert | null>(null);

  const [draftAreaId, setDraftAreaId] = useState("");
  const [draftHorizon, setDraftHorizon] = useState("");
  const [draftLevel, setDraftLevel] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const [areasRes, alertsRes] = await Promise.all([areaApi.list(), alertApi.list({ page_size: "50" })]);
        if (cancelled) return;
        const map: Record<string, string> = {};
        areasRes.data.forEach(a => { map[a.id] = a.name; });
        setAreas(areasRes.data);
        setAreaMap(map);
        setAlerts(alertsRes.data.items.map(r => adaptAlert(r, map)));
      } catch {
        toast.error("Failed to load alerts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  let visibleAlerts = alerts;
  if (role === "coordinator") visibleAlerts = alerts;
  if (statusFilter !== "all") visibleAlerts = visibleAlerts.filter((a) => a.status === statusFilter);

  const canDraft = can("alerts.draft");
  const canReview = can("alerts.review");
  const canDispatch = can("alerts.dispatch");

  const handleApprove = async (alert: FloodAlert) => {
    setActionLoading(true);
    try {
      await alertApi.approve(alert.id);
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, status: "approved" as AlertStatus } : a));
      setSelectedAlert(prev => prev?.id === alert.id ? { ...prev, status: "approved" } : prev);
      toast.success(`Alert "${alert.title}" approved`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve alert");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    setActionLoading(true);
    try {
      await alertApi.reject(rejectDialog.id, rejectReason);
      setAlerts(prev => prev.map(a => a.id === rejectDialog.id ? { ...a, status: "rejected" as AlertStatus, rejectionReason: rejectReason } : a));
      toast.error(`Alert "${rejectDialog.title}" rejected`);
      setRejectDialog(null);
      setRejectReason("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject alert");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = async () => {
    if (!sendConfirm) return;
    setActionLoading(true);
    try {
      await alertApi.send(sendConfirm.id);
      setAlerts(prev => prev.map(a => a.id === sendConfirm.id ? { ...a, status: "sent" as AlertStatus } : a));
      toast.success(`Alert dispatched to subscribers`);
      setSendConfirm(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send alert");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDraftSave = async () => {
    const horizonMap: Record<string, number> = { "6h": 6, "24h": 24, "72h": 72 };
    const levelApiMap: Record<string, string> = { low: "LOW", moderate: "MODERATE", high: "HIGH", severe: "SEVERE" };
    setActionLoading(true);
    try {
      const res = await alertApi.create({
        area_id: draftAreaId || undefined,
        horizon_h: horizonMap[draftHorizon] ?? 24,
        risk_level: levelApiMap[draftLevel] ?? "LOW",
        title: draftTitle,
        message: draftMessage,
      });
      setAlerts(prev => [adaptAlert(res.data, areaMap), ...prev]);
      setShowDraftForm(false);
      setDraftAreaId(""); setDraftHorizon(""); setDraftLevel(""); setDraftTitle(""); setDraftMessage("");
      toast.success("Draft alert created");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create draft");
    } finally {
      setActionLoading(false);
    }
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
          {loading ? (
            <div className="panel flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : visibleAlerts.length === 0 ? (
            <div className="panel flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No alerts match the current filter</p>
            </div>
          ) : visibleAlerts.map((alert) => {
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
                <div><p className="metric-label">Created by</p><p className="font-medium font-mono text-xs">{selectedAlert.createdBy}</p></div>
              </div>
              <div><p className="metric-label mb-1">Message</p><p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-sm p-2.5">{selectedAlert.message}</p></div>
              {selectedAlert.rejectionReason && (
                <div><p className="metric-label mb-1">Rejection Reason</p><p className="text-sm text-severity-critical/80 bg-severity-critical/5 rounded-sm p-2.5 border border-severity-critical/20">{selectedAlert.rejectionReason}</p></div>
              )}
              {canReview && selectedAlert.status === "draft" && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button size="sm" className="flex-1" disabled={actionLoading} onClick={() => handleApprove(selectedAlert)}>
                    {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-severity-critical hover:text-severity-critical" disabled={actionLoading} onClick={() => setRejectDialog(selectedAlert)}>
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              )}
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <p>Created by {selectedAlert.createdBy}</p>
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
              <Select value={draftAreaId} onValueChange={setDraftAreaId}>
                <SelectTrigger><SelectValue placeholder="Select area (optional)" /></SelectTrigger>
                <SelectContent>
                  {areas.map(a => <SelectItem key={a.id} value={a.id}>{a.name} — {a.city}</SelectItem>)}
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
            {draftAreaId && (
              <div className="rounded-sm bg-muted/50 p-2.5 text-xs text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {areas.find(a => a.id === draftAreaId)?.name ?? "Selected area"}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDraftForm(false)}>Cancel</Button>
            <Button disabled={!draftHorizon || !draftLevel || !draftTitle || !draftMessage || actionLoading} onClick={handleDraftSave}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
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
                <div><p className="text-muted-foreground text-xs">Channel</p><p className="font-medium">SMS + WhatsApp</p></div>
                <div><p className="text-muted-foreground text-xs">Risk Level</p><Badge variant={riskBadgeVariant[sendConfirm.riskLevel]}>{sendConfirm.riskLevel}</Badge></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendConfirm(null)}>Cancel</Button>
            <Button disabled={actionLoading} onClick={handleSend}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send Now</>}
            </Button>
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
            <Button variant="destructive" disabled={rejectReason.length < 5 || actionLoading} onClick={handleReject}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
