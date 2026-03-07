import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  text: string;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Inline help icon with tooltip explaining a geospatial or domain concept.
 */
export function HelpTooltip({ text, className, side = "top" }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={cn("inline-flex text-muted-foreground hover:text-foreground transition-colors", className)}>
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
