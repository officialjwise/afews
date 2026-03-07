import { Users, MapPin, Phone, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/shared/DataTable";

interface Subscription {
  id: string;
  phone: string;
  channel: "SMS" | "WhatsApp";
  areas: string[];
  subscribedAt: string;
  status: "active" | "inactive";
}

const MOCK: Subscription[] = [
  { id: "s1", phone: "+234 801 ***4567", channel: "SMS", areas: ["Makoko", "Ajegunle"], subscribedAt: "2d ago", status: "active" },
  { id: "s2", phone: "+234 902 ***8901", channel: "WhatsApp", areas: ["Lekki Phase 1"], subscribedAt: "5d ago", status: "active" },
  { id: "s3", phone: "+234 803 ***2345", channel: "SMS", areas: ["Makoko", "Victoria Island", "Ikoyi"], subscribedAt: "1w ago", status: "active" },
  { id: "s4", phone: "+234 701 ***6789", channel: "WhatsApp", areas: ["Surulere"], subscribedAt: "2w ago", status: "inactive" },
  { id: "s5", phone: "+234 805 ***0123", channel: "SMS", areas: ["Ajegunle", "Makoko"], subscribedAt: "3d ago", status: "active" },
];

const columns: Column<Subscription>[] = [
  {
    key: "phone",
    header: "Phone",
    render: (r) => <span className="font-mono text-sm">{r.phone}</span>,
  },
  {
    key: "channel",
    header: "Channel",
    render: (r) => (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {r.channel === "SMS" ? <Phone className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
        {r.channel}
      </span>
    ),
  },
  {
    key: "areas",
    header: "Areas",
    render: (r) => (
      <div className="flex flex-wrap gap-1">
        {r.areas.map((a) => (
          <span key={a} className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium">
            <MapPin className="h-2.5 w-2.5" /> {a}
          </span>
        ))}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge variant={r.status === "active" ? "low" : "moderate"}>
        {r.status}
      </Badge>
    ),
  },
  {
    key: "subscribedAt",
    header: "Subscribed",
    render: (r) => <span className="text-xs text-muted-foreground">{r.subscribedAt}</span>,
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of all public alert subscriptions</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="panel space-y-1">
          <p className="metric-label">Total Active</p>
          <p className="metric-value">8,420</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">SMS</p>
          <p className="metric-value">5,240</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">WhatsApp</p>
          <p className="metric-value">3,180</p>
        </div>
        <div className="panel space-y-1">
          <p className="metric-label">Inactive</p>
          <p className="metric-value text-muted-foreground">342</p>
        </div>
      </div>

      <DataTable
        data={MOCK}
        columns={columns}
        rowKey={(r) => r.id}
        searchable
        searchKeys={["phone"] as any}
        emptyIcon={<Users className="h-8 w-8 opacity-50" />}
        emptyMessage="No subscriptions found"
      />
    </div>
  );
}
