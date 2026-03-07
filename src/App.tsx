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
import ManageSubscription from "./pages/ManageSubscription";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AreasPage from "./pages/AreasPage";
import AreaDetailPage from "./pages/AreaDetailPage";
import TilesPage from "./pages/TilesPage";
import RiskPage from "./pages/RiskPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";

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
            <Route path="/manage-subscription" element={<ManageSubscription />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Authenticated app shell */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* All authenticated roles */}
              <Route path="/areas" element={<AreasPage />} />
              <Route path="/areas/:id" element={<AreaDetailPage />} />
              <Route path="/tiles" element={<TilesPage />} />
              <Route path="/risk" element={<RiskPage />} />
              <Route path="/alerts" element={<AlertsPage />} />

              {/* Stakeholder + Admin */}
              <Route path="/workflow" element={
                <ProtectedRoute allowedRoles={["admin", "stakeholder"]}>
                  <PlaceholderPage title="Alert Workflow" description="Multi-stage alert review and approval process" />
                </ProtectedRoute>
              } />

              {/* Coordinator only */}
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={["coordinator", "admin", "stakeholder"]}>
                  <ReportsPage />
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
                  <SettingsPage />
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
