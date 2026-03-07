import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PublicSubscribe from "./pages/PublicSubscribe";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/subscribe" element={<PublicSubscribe />} />

          {/* Authenticated app shell */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/areas" element={<PlaceholderPage title="Areas & Tiles" description="Manage neighbourhood polygons and modelling grid cells" />} />
            <Route path="/risk" element={<PlaceholderPage title="Risk Analysis" description="Baseline flood risk computation and tile-level assessment" />} />
            <Route path="/alerts" element={<PlaceholderPage title="Alerts" description="Draft, review, approve, and dispatch flood alerts" />} />
            <Route path="/ingestion" element={<PlaceholderPage title="Data Ingestion" description="Climate and terrain data pipeline management" />} />
            <Route path="/workflow" element={<PlaceholderPage title="Alert Workflow" description="Multi-stage alert review and approval process" />} />
            <Route path="/users" element={<PlaceholderPage title="Users & Roles" description="Manage Admin, Stakeholder, and Coordinator access" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" description="System configuration and platform preferences" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
