import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Play, Loader2, CheckCircle2, Clock, Database, Cloud, Layers, Activity } from "lucide-react";

interface Job {
  id: string;
  name: string;
  description: string;
  lastRun: string;
  status: "active" | "pending" | "error";
  icon: React.ElementType;
}

const JOBS: Job[] = [
  { id: "ingest-openmeteo", name: "Ingest Open-Meteo", description: "Fetch latest rainfall and weather data from Open-Meteo API", lastRun: "42 min ago", status: "active", icon: Cloud },
  { id: "ingest-chirps", name: "Ingest CHIRPS", description: "Sync CHIRPS satellite rainfall estimates", lastRun: "6h ago", status: "active", icon: Cloud },
  { id: "ingest-dem", name: "Ingest DEM Data", description: "Update elevation and slope data from Copernicus DEM", lastRun: "2d ago", status: "active", icon: Layers },
  { id: "compute-features", name: "Compute Features", description: "Generate per-tile features from ingested data", lastRun: "38 min ago", status: "active", icon: Database },
  { id: "compute-risk", name: "Compute Risk", description: "Run baseline risk model across all tiles and areas", lastRun: "18 min ago", status: "active", icon: Activity },
];

export default function JobsPage() {
  const [running, setRunning] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const triggerJob = async (id: string) => {
    setRunning(id);
    await new Promise((r) => setTimeout(r, 2500));
    setRunning(null);
    setCompleted((prev) => new Set(prev).add(id));
    setTimeout(() => setCompleted((prev) => { const n = new Set(prev); n.delete(id); return n; }), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Jobs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Trigger data ingestion and risk computation pipelines</p>
      </div>

      <div className="space-y-3">
        {JOBS.map((job) => {
          const Icon = job.icon;
          const isRunning = running === job.id;
          const isDone = completed.has(job.id);
          return (
            <div key={job.id} className="panel flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="rounded-md bg-secondary p-2 mt-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{job.name}</p>
                  <p className="text-xs text-muted-foreground">{job.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Last: {job.lastRun}
                    </span>
                    <StatusIndicator status={job.status} />
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => triggerJob(job.id)}
                disabled={isRunning}
              >
                {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                 isDone ? <><CheckCircle2 className="h-3.5 w-3.5 text-status-active" /> Done</> :
                 <><Play className="h-3.5 w-3.5" /> Run</>}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
