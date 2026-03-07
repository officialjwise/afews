import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PublicSubscribe from "./pages/PublicSubscribe";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/subscribe" element={<PublicSubscribe />} />

            {/* Authenticated app shell */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* All authenticated roles */}
              <Route path="/areas" element={<PlaceholderPage title="Areas & Tiles" description="Manage neighbourhood polygons and modelling grid cells" />} />
              <Route path="/risk" element={<PlaceholderPage title="Risk Analysis" description="Baseline flood risk computation and tile-level assessment" />} />
              <Route path="/alerts" element={<PlaceholderPage title="Alerts" description="Draft, review, approve, and dispatch flood alerts" />} />

              {/* Stakeholder + Admin */}
              <Route path="/workflow" element={
                <ProtectedRoute allowedRoles={["admin", "stakeholder"]}>
                  <PlaceholderPage title="Alert Workflow" description="Multi-stage alert review and approval process" />
                </ProtectedRoute>
              } />

              {/* Admin only */}
              <Route path="/ingestion" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PlaceholderPage title="Data Ingestion" description="Climate and terrain data pipeline management" />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PlaceholderPage title="Users & Roles" description="Manage Admin, Stakeholder, and Coordinator access" />
                </ProtectedRoute>
              } />
              <Route path="/audit" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PlaceholderPage title="Audit Log" description="System activity and change history" />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PlaceholderPage title="Settings" description="System configuration and platform preferences" />
                </ProtectedRoute>
              } />

              {/* Coordinator only */}
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={["coordinator"]}>
                  <PlaceholderPage title="Field Reports" description="Submit observations and post-event confirmations" />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
