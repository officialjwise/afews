import {
  LayoutDashboard,
  Map,
  Bell,
  Users,
  FileText,
  Settings,
  Shield,
  Layers,
  Activity,
  ClipboardList,
  ScrollText,
  Grid3X3,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { StatusIndicator } from "@/components/StatusIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { type NavItem, filterByRole, ROLE_META } from "@/lib/roles";
import { cn } from "@/lib/utils";

const operationsNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "stakeholder", "coordinator"] },
  { title: "Areas", url: "/areas", icon: Map, roles: ["admin", "stakeholder", "coordinator"] },
  { title: "Tiles", url: "/tiles", icon: Grid3X3, roles: ["admin", "stakeholder", "coordinator"] },
  { title: "Risk Analysis", url: "/risk", icon: Activity, roles: ["admin", "stakeholder", "coordinator"] },
  { title: "Alerts", url: "/alerts", icon: Bell, roles: ["admin", "stakeholder", "coordinator"] },
  { title: "Field Reports", url: "/reports", icon: ClipboardList, roles: ["coordinator"] },
];

const adminNav: NavItem[] = [
  { title: "Data Ingestion", url: "/ingestion", icon: Layers, roles: ["admin"] },
  { title: "Alert Workflow", url: "/workflow", icon: FileText, roles: ["admin", "stakeholder"] },
  { title: "Users & Roles", url: "/users", icon: Users, roles: ["admin"] },
  { title: "Audit Log", url: "/audit", icon: ScrollText, roles: ["admin"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { role } = useAuth();

  const visibleOps = filterByRole(operationsNav, role);
  const visibleAdmin = filterByRole(adminNav, role);
  const roleMeta = ROLE_META[role];

  const renderNav = (items: NavItem[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end
            className="hover:bg-sidebar-accent"
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-sidebar-primary flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-accent-foreground tracking-tight">A-FEWS</span>
              <span className="text-[10px] text-sidebar-muted leading-tight">Flood Early Warning System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderNav(visibleOps)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderNav(visibleAdmin)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        {!collapsed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <StatusIndicator status="active" label="System Online" className="text-sidebar-muted" />
              <span className="text-[10px] text-sidebar-muted font-mono">v0.1.0</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
