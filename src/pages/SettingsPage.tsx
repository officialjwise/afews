import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusIndicator } from "@/components/StatusIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { ListSkeleton, MetricsSkeleton } from "@/components/shared/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  User, Settings2, Bell, Link2, Activity, Save, Loader2, CheckCircle2,
  Globe, Database, Cloud, MessageSquare,
} from "lucide-react";

const COUNTRIES = [
  "Ghana", "Nigeria", "Kenya", "Senegal", "Tanzania", "Uganda", "Cameroon",
  "Ethiopia", "South Africa", "Mozambique", "Rwanda", "Côte d'Ivoire",
];

const GHANA_CITIES = [
  "Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Ho", "Sunyani",
  "Koforidua", "Bolgatanga", "Wa", "Tema", "Techiman",
];

function FormSkeleton() {
  return (
    <div className="panel space-y-5">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
      <Skeleton className="h-8 w-28 rounded-md" />
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isLoading = useSimulatedLoading(1000);
  const [saving, setSaving] = useState(false);
  const [savedTab, setSavedTab] = useState<string | null>(null);
  const [defaultCountry, setDefaultCountry] = useState("Ghana");
  const [defaultCity, setDefaultCity] = useState("Accra");

  const handleSave = async (tab: string) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSavedTab(tab);
    toast.success("Settings saved successfully");
    setTimeout(() => setSavedTab(null), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System configuration and platform preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5"><Settings2 className="h-3.5 w-3.5" /> System</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Alerts</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5"><Link2 className="h-3.5 w-3.5" /> Integrations</TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5"><Activity className="h-3.5 w-3.5" /> Health</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-6">
          {isLoading ? <FormSkeleton /> : (
            <div className="panel space-y-5">
              <h2 className="text-sm font-semibold">Profile Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Full name</Label>
                  <Input defaultValue={user?.displayName || ""} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input defaultValue={user?.email || ""} type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Input value={user?.role || ""} disabled className="capitalize" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>New password</Label>
                  <Input type="password" placeholder="Leave blank to keep current" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</h3>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Email notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">System alerts</Label>
                  <Switch defaultChecked />
                </div>
              </div>
              <SaveButton tab="profile" saving={saving} savedTab={savedTab} onSave={handleSave} />
            </div>
          )}
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="mt-6 space-y-6">
          {isLoading ? <><FormSkeleton /><FormSkeleton /></> : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="panel space-y-5">
                  <h2 className="text-sm font-semibold">Defaults</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Default country</Label>
                      <Select value={defaultCountry} onValueChange={setDefaultCountry}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Default city</Label>
                      <Select value={defaultCity} onValueChange={setDefaultCity}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {GHANA_CITIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Default tile size (m)</Label>
                      <Select defaultValue="100">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50m</SelectItem>
                          <SelectItem value="100">100m</SelectItem>
                          <SelectItem value="250">250m</SelectItem>
                          <SelectItem value="500">500m</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Default forecast horizon</Label>
                      <Select defaultValue="24h">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6h">6 hours</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                          <SelectItem value="72h">72 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <SaveButton tab="system-defaults" saving={saving} savedTab={savedTab} onSave={handleSave} />
                </div>

                <div className="panel space-y-5">
                  <h2 className="text-sm font-semibold">Risk Thresholds</h2>
                  <p className="text-xs text-muted-foreground">Define the score boundaries for each risk level.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Low max", defaultVal: "0.39", color: "text-severity-low" },
                      { label: "Moderate max", defaultVal: "0.59", color: "text-severity-moderate" },
                      { label: "High max", defaultVal: "0.79", color: "text-severity-high" },
                      { label: "Severe min", defaultVal: "0.80", color: "text-severity-critical" },
                    ].map((t) => (
                      <div key={t.label} className="space-y-1.5">
                        <Label className={t.color}>{t.label}</Label>
                        <Input defaultValue={t.defaultVal} className="font-mono" />
                      </div>
                    ))}
                  </div>
                  <SaveButton tab="risk-thresholds" saving={saving} savedTab={savedTab} onSave={handleSave} />
                </div>
              </div>

              <div className="panel space-y-5">
                <h2 className="text-sm font-semibold">Map Defaults</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Centre latitude</Label>
                    <Input defaultValue="5.6037" className="font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Centre longitude</Label>
                    <Input defaultValue="-0.1870" className="font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Default zoom</Label>
                    <Input defaultValue="12" type="number" className="font-mono" />
                  </div>
                </div>
                <SaveButton tab="map-defaults" saving={saving} savedTab={savedTab} onSave={handleSave} />
              </div>
            </>
          )}
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="mt-6 space-y-6">
          {isLoading ? <><FormSkeleton /><FormSkeleton /></> : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="panel space-y-5">
                  <h2 className="text-sm font-semibold">SMS Provider</h2>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>API key reference</Label>
                      <Input defaultValue="••••••••••••3f9a" disabled className="font-mono" />
                      <p className="text-xs text-muted-foreground">Stored securely. Contact admin to update.</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Sender name</Label>
                      <Input defaultValue="A-FEWS" />
                    </div>
                  </div>
                </div>

                <div className="panel space-y-5">
                  <h2 className="text-sm font-semibold">WhatsApp Provider</h2>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>API key reference</Label>
                      <Input defaultValue="••••••••••••7b2c" disabled className="font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Business phone number</Label>
                      <Input defaultValue="+233 20 000 0001" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="panel space-y-5">
                  <h2 className="text-sm font-semibold">Message Templates</h2>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Alert template</Label>
                      <Textarea
                        rows={3}
                        defaultValue="⚠️ A-FEWS ALERT: {{risk_level}} flood risk in {{area_name}}. {{message}} Stay safe."
                        className="font-mono text-xs"
                      />
                      <p className="text-xs text-muted-foreground">Variables: {"{{risk_level}}, {{area_name}}, {{message}}"}</p>
                    </div>
                  </div>
                </div>

                <div className="panel space-y-5">
                  <h2 className="text-sm font-semibold">Retry & Escalation</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Max retry attempts</Label>
                      <Input defaultValue="3" type="number" className="font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Backoff (seconds)</Label>
                      <Input defaultValue="60" type="number" className="font-mono" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Escalate on total failure</Label>
                    <Switch defaultChecked />
                  </div>
                  <SaveButton tab="alerts" saving={saving} savedTab={savedTab} onSave={handleSave} />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-6">
          {isLoading ? <ListSkeleton count={5} /> : (
            <div className="space-y-3">
              {[
                { name: "Nominatim API", endpoint: "https://nominatim.openstreetmap.org", status: "active" as const },
                { name: "Overpass API", endpoint: "https://overpass-api.de/api", status: "active" as const },
                { name: "Google Cloud Storage", endpoint: "gs://afews-data-bucket", status: "active" as const },
                { name: "Open-Meteo", endpoint: "https://api.open-meteo.com", status: "active" as const },
                { name: "CHIRPS Rainfall", endpoint: "https://data.chc.ucsb.edu", status: "pending" as const },
                { name: "Copernicus DEM", endpoint: "https://peps.cnes.fr", status: "active" as const },
                { name: "NASA GPM", endpoint: "https://gpm.nasa.gov", status: "inactive" as const },
              ].map((int) => (
                <div key={int.name} className="panel flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{int.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{int.endpoint}</p>
                  </div>
                  <StatusIndicator status={int.status} label={int.status} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Health */}
        <TabsContent value="health" className="mt-6">
          {isLoading ? <ListSkeleton count={4} /> : (
            <div className="space-y-3">
              {[
                { name: "Database", icon: Database, status: "active" as const, detail: "PostgreSQL — 4ms latency" },
                { name: "GCS Bucket", icon: Cloud, status: "active" as const, detail: "afews-data-bucket — accessible" },
                { name: "Ingestion Pipeline", icon: Activity, status: "active" as const, detail: "Last run: 42 min ago — 3 sources synced" },
                { name: "Risk Compute", icon: Activity, status: "active" as const, detail: "Last computed: 18 min ago — all areas" },
                { name: "SMS Provider", icon: MessageSquare, status: "active" as const, detail: "Twilio — 99.8% uptime" },
                { name: "WhatsApp Provider", icon: MessageSquare, status: "pending" as const, detail: "Meta Business API — rate limit approaching" },
              ].map((h) => (
                <div key={h.name} className="panel flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{h.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{h.detail}</p>
                  </div>
                  <StatusIndicator status={h.status} label={h.status === "active" ? "Healthy" : "Warning"} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SaveButton({ tab, saving, savedTab, onSave }: {
  tab: string; saving: boolean; savedTab: string | null; onSave: (tab: string) => void;
}) {
  return (
    <Button onClick={() => onSave(tab)} disabled={saving} size="sm">
      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
       savedTab === tab ? <><CheckCircle2 className="h-3.5 w-3.5" /> Saved</> :
       <><Save className="h-3.5 w-3.5" /> Save changes</>}
    </Button>
  );
}
