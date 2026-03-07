import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudRain, Database, Globe, Layers, Play, RefreshCw, AlertTriangle, CheckCircle2, Clock, Brain } from "lucide-react";
import { toast } from "sonner";
import { ingestionApi } from "@/lib/api";
import { WeatherDashboard } from "@/components/weather/WeatherDashboard";

const DATA_SOURCES = [
  { id: "open-meteo", name: "Open-Meteo", type: "Weather Forecast", frequency: "Every 6 hours", lastRun: "2 hours ago", status: "healthy", icon: CloudRain, description: "Global weather forecast data including precipitation, temperature, and wind." },
  { id: "chirps", name: "CHIRPS", type: "Historical Rainfall", frequency: "Daily", lastRun: "1 day ago", status: "healthy", icon: Database, description: "Climate Hazards Group InfraRed Precipitation with Station data (30+ year history)." },
  { id: "copernicus-dem", name: "Copernicus DEM", type: "Digital Elevation Model", frequency: "On Demand", lastRun: "30 days ago", status: "healthy", icon: Layers, description: "High-resolution digital elevation model (GLO-30) for terrain analysis." },
  { id: "osm", name: "OpenStreetMap", type: "Vector Data", frequency: "Weekly", lastRun: "5 days ago", status: "warning", icon: Globe, description: "Building footprints, roads, and critical infrastructure data via Overpass API." },
];

const PIPELINE_LOGS = [
  { id: 1, source: "Open-Meteo", action: "Fetch Forecast", status: "success", timestamp: "2023-11-15 08:00:00", duration: "45s", details: "Retrieved 450MB of GRIB2 data for Greater Accra" },
  { id: 2, source: "Open-Meteo", action: "Process GRIB", status: "success", timestamp: "2023-11-15 08:00:45", duration: "120s", details: "Processed 12 tiles" },
  { id: 3, source: "CHIRPS", action: "Daily Sync", status: "success", timestamp: "2023-11-14 23:00:00", duration: "15s", details: "No new data found" },
  { id: 4, source: "OSM", action: "Area Update (Alajo)", status: "failed", timestamp: "2023-11-10 14:30:00", duration: "300s", details: "Timeout connecting to Overpass API" },
  { id: 5, source: "Copernicus DEM", action: "Tile Gen", status: "success", timestamp: "2023-10-15 09:00:00", duration: "15m", details: "Generated 50 tiles for Accra" },
];

export default function IngestionPage() {
  const [triggering, setTriggering] = useState<string | null>(null);

  const handleTrigger = async (sourceId: string) => {
    setTriggering(sourceId);
    try {
      await ingestionApi.trigger(sourceId);
      toast.success(`Pipeline triggered for ${sourceId}`);
    } catch (error) {
      toast.error(`Failed to trigger ${sourceId}`);
    } finally {
      setTimeout(() => setTriggering(null), 1000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Data Ingestion</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage external data pipelines and ingestion status</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Status refreshed")}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Status
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {DATA_SOURCES.map((source) => (
          <Card key={source.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
              <source.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className={`inline-flex h-2.5 w-2.5 rounded-full ${source.status === "healthy" ? "bg-status-active" : "bg-status-pending"}`} />
                <span className="capitalize text-sm font-medium text-muted-foreground">{source.status}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last run: {source.lastRun}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="weather" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weather">Live Weather</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="logs">Pipeline Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="weather">
          <WeatherDashboard />
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4">
            {DATA_SOURCES.map((source) => (
              <div key={source.id} className="panel flex items-center justify-between p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-md"><source.icon className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-sm">{source.name}</h3>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px]">{source.type}</Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {source.frequency}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="secondary" disabled={triggering === source.id} onClick={() => handleTrigger(source.id)}>
                  {triggering === source.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                  Trigger Now
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="panel p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Source</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Action</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Duration</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {PIPELINE_LOGS.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      {log.status === "success" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-active"><CheckCircle2 className="h-3.5 w-3.5" /> Success</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-status-error"><AlertTriangle className="h-3.5 w-3.5" /> Failed</span>
                      )}
                    </td>
                    <td className="p-4 font-medium">{log.source}</td>
                    <td className="p-4"><div>{log.action}</div><div className="text-xs text-muted-foreground">{log.details}</div></td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{log.duration}</td>
                    <td className="p-4 text-muted-foreground text-xs">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
