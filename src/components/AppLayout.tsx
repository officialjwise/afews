import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">Flood Early Warning & Response</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-1.5 rounded-md hover:bg-secondary transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-severity-critical text-[9px] font-bold text-destructive-foreground flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">AD</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
