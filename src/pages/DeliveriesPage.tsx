import { useState, useEffect } from "react";
import { Send, CheckCircle2, XCircle, Clock, MessageSquare, MapPin, Loader2 } from "lucide-react";
import { DataTable, Column } from "@/components/shared/DataTable";
import { deliveryApi, type DeliveryRow } from "@/lib/api";
import { toast } from "sonner";

interface Delivery {
  id: string;
  alertTitle: string;
  area: string;
  channel: string;
  sent: number;
  failed: number;
  pending: number;
  status: "complete" | "in_progress" | "failed";
  dispatchedAt: string;
}

function adaptDelivery(r: DeliveryRow): Delivery {
  return {
    id: r.id,
    alertTitle: r.alert_title,
    area: r.area_name ?? "—",
    channel: r.channel.toUpperCase() === "WHATSAPP" ? "WhatsApp" : r.channel.toUpperCase(),
    sent: r.sent,
    failed: r.failed,
    pending: r.pending,
    status: r.status,
    dispatchedAt: r.dispatched_at ? new Date(r.dispatched_at).toLocaleString() : "—",
  };
}

const statusStyle: Record<string, string> = {
  complete: "bg-status-active/15 text-status-active",
  in_progress: "bg-status-pending/15 text-status-pending",
  failed: "bg-severity-critical/15 text-severity-critical",
};

const STATUS_OPTIONS = ["all", "complete", "in_progress", "failed"] as const;
const CHANNEL_OPTIONS = ["all", "SMS", "WhatsApp"] as const;

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
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    deliveryApi.list()
      .then((res) => {
        if (!cancelled) setDeliveries((res.data?.items ?? []).map(adaptDelivery));
      })
      .catch(() => toast.error("Failed to load delivery data."))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totalSent = deliveries.reduce((s, d) => s + d.sent, 0);
  const totalFailed = deliveries.reduce((s, d) => s + d.failed, 0);
  const totalPending = deliveries.reduce((s, d) => s + d.pending, 0);
  const successRate = totalSent + totalFailed > 0
    ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1)
    : "—";

  const filtered = deliveries.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (channelFilter !== "all" && d.channel !== channelFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Delivery Tracking</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor alert dispatch status across all channels</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="panel space-y-1">
          <p className="metric-label">Total Sent</p>
          <p className="metric-value text-status-active">{totalSent.toLocaleString()}</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Failed</p>
          <p className="metric-value text-severity-critical">{totalFailed.toLocaleString()}</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Pending</p>
          <p className="metric-value text-status-pending">{totalPending.toLocaleString()}</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Success Rate</p>
          <p className="metric-value">{successRate}%</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors border ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Channel:</span>
          {CHANNEL_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setChannelFilter(c)}
              className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors border ${
                channelFilter === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        pageSize={5}
        searchable
        searchKeys={["alertTitle", "area"] as any}
        emptyIcon={loading ? <Loader2 className="h-8 w-8 opacity-50 animate-spin" /> : <Send className="h-8 w-8 opacity-50" />}
        emptyMessage={loading ? "Loading deliveries..." : "No deliveries found"}
      />
    </div>
  );
}
