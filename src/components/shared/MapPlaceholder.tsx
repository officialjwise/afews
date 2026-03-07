import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapPlaceholderProps {
  height?: number | string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
}

/**
 * Placeholder for future Leaflet / Mapbox GL integration.
 * Provides a styled container that will be replaced with a real map component.
 */
export function MapPlaceholder({ height = 300, className, children, label = "Map view" }: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-muted/30 relative overflow-hidden",
        className
      )}
      style={{ height }}
    >
      {children || (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{label}</p>
            <p className="text-[10px] mt-1 opacity-60">Leaflet / Mapbox GL integration pending</p>
          </div>
        </div>
      )}
    </div>
  );
}
