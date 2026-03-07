import { Construction, Send, Truck, CheckCircle2, XCircle, Clock, MessageSquare, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/shared/DataTable";

interface Delivery {
  id: string;
  alertTitle: string;
  area: string;
  channel: "SMS" | "WhatsApp";
  sent: number;
  failed: number;
  pending: number;
  status: "complete" | "in_progress" | "failed";
  dispatchedAt: string;
}

const MOCK: Delivery[] = [
  { id: "d1", alertTitle: "Severe flooding — Makoko", area: "Makoko", channel: "SMS", sent: 1180, failed: 12, pending: 48, status: "in_progress", dispatchedAt: "12 min ago" },
  { id: "d2", alertTitle: "High risk — Ajegunle", area: "Ajegunle", channel: "WhatsApp", sent: 890, failed: 0, pending: 0, status: "complete", dispatchedAt: "2h ago" },
  { id: "d3", alertTitle: "Moderate advisory — Lekki", area: "Lekki Phase 1", channel: "SMS", sent: 1980, failed: 42, pending: 78, status: "in_progress", dispatchedAt: "1d ago" },
  { id: "d4", alertTitle: "Flash flood alert — VI", area: "Victoria Island", channel: "SMS", sent: 0, failed: 1560, pending: 0, status: "failed", dispatchedAt: "2d ago" },
];

const statusStyle: Record<string, string> = {
  complete: "bg-status-active/15 text-status-active",
  in_progress: "bg-status-pending/15 text-status-pending",
  failed: "bg-severity-critical/15 text-severity-critical",
};

const columns: Column<Delivery>[] = [
  {
    key: "alert",
    header: "Alert",
    render: (r) => (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{r.alertTitle}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.area}</p>
      </div>
    ),
  },
  {
    key: "channel",
    header: "Channel",
    render: (r) => (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <MessageSquare className="h-3 w-3" /> {r.channel}
      </span>
    ),
  },
  {
    key: "sent",
    header: "Sent",
    sortable: true,
    sortValue: (r) => r.sent,
    className: "text-right",
    render: (r) => <span className="font-mono text-sm text-status-active">{r.sent.toLocaleString()}</span>,
  },
  {
    key: "failed",
    header: "Failed",
    sortable: true,
    sortValue: (r) => r.failed,
    className: "text-right",
    render: (r) => <span className="font-mono text-sm text-severity-critical">{r.failed}</span>,
  },
  {
    key: "pending",
    header: "Pending",
    className: "text-right",
    render: (r) => <span className="font-mono text-sm text-status-pending">{r.pending}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${statusStyle[r.status]}`}>
        {r.status === "complete" ? <CheckCircle2 className="h-3 w-3" /> : r.status === "failed" ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
        {r.status.replace("_", " ")}
      </span>
    ),
  },
  {
    key: "time",
    header: "Dispatched",
    render: (r) => <span className="text-xs text-muted-foreground">{r.dispatchedAt}</span>,
  },
];

export default function DeliveriesPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Delivery Tracking</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor alert dispatch status across all channels</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="panel space-y-1">
          <p className="metric-label">Total Sent</p>
          <p className="metric-value text-status-active">4,050</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Failed</p>
          <p className="metric-value text-severity-critical">1,614</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Pending</p>
          <p className="metric-value text-status-pending">126</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Success Rate</p>
          <p className="metric-value">69.9%</p>
        </div>
      </div>

      <DataTable
        data={MOCK}
        columns={columns}
        rowKey={(r) => r.id}
        searchable
        searchKeys={["alertTitle", "area"] as any}
        emptyIcon={<Send className="h-8 w-8 opacity-50" />}
        emptyMessage="No deliveries found"
      />
    </div>
  );
}
