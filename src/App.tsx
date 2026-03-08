import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleRedirect } from "@/components/RoleRedirect";

import PublicSubscribe from "./pages/PublicSubscribe";
import ManageSubscription from "./pages/ManageSubscription";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/Dashboard";
import AreasPage from "./pages/AreasPage";
import AreaDetailPage from "./lib/AreaDetailPage";
import TilesPage from "./pages/TilesPage";
import RiskPage from "./pages/RiskPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import IngestionPage from "./pages/IngestionPage";

import DeliveriesPage from "./pages/DeliveriesPage";
import JobsPage from "./pages/JobsPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import AuditPage from "./pages/AuditPage";
import HealthPage from "./pages/HealthPage";

import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import StakeholderDashboard from "./pages/stakeholder/StakeholderDashboard";
import StakeholderHotspotsPage from "./pages/stakeholder/StakeholderHotspotsPage";
import FloodEventPage from "./pages/coordinator/FloodEventPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/subscribe" element={<PublicSubscribe />} />
            <Route path="/public/alerts/subscribe" element={<PublicSubscribe />} />
            <Route path="/public/alerts/verify" element={<PublicSubscribe />} />
            <Route path="/public/alerts/manage" element={<ManageSubscription />} />
            <Route path="/manage-subscription" element={<ManageSubscription />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Authenticated app shell */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<RoleRedirect />} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/areas" element={<ProtectedRoute allowedRoles={["admin"]}><AreasPage /></ProtectedRoute>} />
              <Route path="/admin/areas/import" element={<ProtectedRoute allowedRoles={["admin"]}><AreasPage /></ProtectedRoute>} />
              <Route path="/admin/areas/:id" element={<ProtectedRoute allowedRoles={["admin"]}><AreaDetailPage /></ProtectedRoute>} />
              <Route path="/admin/tiles" element={<ProtectedRoute allowedRoles={["admin"]}><TilesPage /></ProtectedRoute>} />
              <Route path="/admin/tiles/generate" element={<ProtectedRoute allowedRoles={["admin"]}><TilesPage /></ProtectedRoute>} />
              <Route path="/admin/risk" element={<ProtectedRoute allowedRoles={["admin"]}><RiskPage /></ProtectedRoute>} />
              <Route path="/admin/risk/map" element={<ProtectedRoute allowedRoles={["admin"]}><RiskPage /></ProtectedRoute>} />
              <Route path="/admin/alerts" element={<ProtectedRoute allowedRoles={["admin"]}><AlertsPage /></ProtectedRoute>} />
              <Route path="/admin/alerts/new" element={<ProtectedRoute allowedRoles={["admin"]}><AlertsPage /></ProtectedRoute>} />
              <Route path="/admin/alerts/:id" element={<ProtectedRoute allowedRoles={["admin"]}><AlertsPage /></ProtectedRoute>} />
              <Route path="/admin/deliveries" element={<ProtectedRoute allowedRoles={["admin"]}><DeliveriesPage /></ProtectedRoute>} />
              <Route path="/admin/ingestion" element={<ProtectedRoute allowedRoles={["admin"]}><IngestionPage /></ProtectedRoute>} />
              <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={["admin"]}><JobsPage /></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={["admin"]}><SubscriptionsPage /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={["admin"]}><RolesPage /></ProtectedRoute>} />
              <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={["admin"]}><AuditPage /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><SettingsPage /></ProtectedRoute>} />
              <Route path="/admin/settings/messaging" element={<ProtectedRoute allowedRoles={["admin"]}><SettingsPage /></ProtectedRoute>} />
              <Route path="/admin/settings/integrations" element={<ProtectedRoute allowedRoles={["admin"]}><SettingsPage /></ProtectedRoute>} />
              <Route path="/admin/health" element={<ProtectedRoute allowedRoles={["admin"]}><HealthPage /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><ProfilePage /></ProtectedRoute>} />

              {/* Stakeholder */}
              <Route path="/stakeholder" element={<ProtectedRoute allowedRoles={["stakeholder"]}><StakeholderDashboard /></ProtectedRoute>} />
              <Route path="/stakeholder/risk" element={<ProtectedRoute allowedRoles={["stakeholder"]}><RiskPage /></ProtectedRoute>} />
              <Route path="/stakeholder/hotspots" element={<ProtectedRoute allowedRoles={["stakeholder"]}><StakeholderHotspotsPage /></ProtectedRoute>} />
              <Route path="/stakeholder/alerts" element={<ProtectedRoute allowedRoles={["stakeholder"]}><AlertsPage /></ProtectedRoute>} />
              <Route path="/stakeholder/alerts/:id" element={<ProtectedRoute allowedRoles={["stakeholder"]}><AlertsPage /></ProtectedRoute>} />
              <Route path="/stakeholder/deliveries" element={<ProtectedRoute allowedRoles={["stakeholder"]}><DeliveriesPage /></ProtectedRoute>} />
              <Route path="/stakeholder/reports" element={<ProtectedRoute allowedRoles={["stakeholder"]}><ReportsPage /></ProtectedRoute>} />
              <Route path="/stakeholder/profile" element={<ProtectedRoute allowedRoles={["stakeholder"]}><ProfilePage /></ProtectedRoute>} />

              {/* Coordinator */}
              <Route path="/coordinator" element={<ProtectedRoute allowedRoles={["coordinator"]}><CoordinatorDashboard /></ProtectedRoute>} />
              <Route path="/coordinator/areas" element={<ProtectedRoute allowedRoles={["coordinator"]}><AreasPage /></ProtectedRoute>} />
              <Route path="/coordinator/areas/:id" element={<ProtectedRoute allowedRoles={["coordinator"]}><AreaDetailPage /></ProtectedRoute>} />
              <Route path="/coordinator/alerts" element={<ProtectedRoute allowedRoles={["coordinator"]}><AlertsPage /></ProtectedRoute>} />
              <Route path="/coordinator/alerts/new" element={<ProtectedRoute allowedRoles={["coordinator"]}><AlertsPage /></ProtectedRoute>} />
              <Route path="/coordinator/alerts/:id" element={<ProtectedRoute allowedRoles={["coordinator"]}><AlertsPage /></ProtectedRoute>} />
              <Route path="/coordinator/reports" element={<ProtectedRoute allowedRoles={["coordinator"]}><ReportsPage /></ProtectedRoute>} />
              <Route path="/coordinator/reports/new" element={<ProtectedRoute allowedRoles={["coordinator"]}><ReportsPage /></ProtectedRoute>} />
              <Route path="/coordinator/events/new" element={<ProtectedRoute allowedRoles={["coordinator"]}><FloodEventPage /></ProtectedRoute>} />
              <Route path="/coordinator/risk" element={<ProtectedRoute allowedRoles={["coordinator"]}><RiskPage /></ProtectedRoute>} />
              <Route path="/coordinator/profile" element={<ProtectedRoute allowedRoles={["coordinator"]}><ProfilePage /></ProtectedRoute>} />

              {/* Legacy redirects */}
              <Route path="/dashboard" element={<RoleRedirect />} />
              <Route path="/areas/*" element={<RoleRedirect fallback="/admin/areas" />} />
              <Route path="/tiles/*" element={<RoleRedirect fallback="/admin/tiles" />} />
              <Route path="/risk/*" element={<RoleRedirect fallback="/admin/risk" />} />
              <Route path="/alerts/*" element={<RoleRedirect fallback="/admin/alerts" />} />
              <Route path="/reports/*" element={<RoleRedirect fallback="/admin/reports" />} />
              <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
