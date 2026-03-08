import {
  LayoutDashboard, Map, Bell, Users, FileText, Settings, Shield, Layers,
  Activity, ScrollText, Grid3X3, Send, UserCircle, Zap, BarChart3, Heart,
  AlertTriangle, MapPin, ClipboardList,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { StatusIndicator } from "@/components/StatusIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { type NavItem } from "@/lib/roles";
import afewsLogo from "@/assets/afews-logo.png";

const adminOpsNav: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["admin"] },
  { title: "Areas", url: "/admin/areas", icon: Map, roles: ["admin"] },
  { title: "Tiles", url: "/admin/tiles", icon: Grid3X3, roles: ["admin"] },
  { title: "Risk Analysis", url: "/admin/risk", icon: Activity, roles: ["admin"] },
  { title: "Alerts", url: "/admin/alerts", icon: Bell, roles: ["admin"] },
  { title: "Deliveries", url: "/admin/deliveries", icon: Send, roles: ["admin"] },
];

const adminMgmtNav: NavItem[] = [
  { title: "Jobs", url: "/admin/jobs", icon: Zap, roles: ["admin"] },
  { title: "Data Ingestion", url: "/admin/ingestion", icon: Layers, roles: ["admin"] },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: Users, roles: ["admin"] },
  { title: "Users & Roles", url: "/admin/users", icon: Users, roles: ["admin"] },
  { title: "Permissions", url: "/admin/roles", icon: Shield, roles: ["admin"] },
  { title: "Audit Log", url: "/admin/audit", icon: ScrollText, roles: ["admin"] },
];

const adminSysNav: NavItem[] = [
  { title: "Settings", url: "/admin/settings", icon: Settings, roles: ["admin"] },
  { title: "System Health", url: "/admin/health", icon: Heart, roles: ["admin"] },
  { title: "Profile", url: "/admin/profile", icon: UserCircle, roles: ["admin"] },
];

const stakeholderNav: NavItem[] = [
  { title: "Dashboard", url: "/stakeholder", icon: LayoutDashboard, roles: ["stakeholder"] },
  { title: "Risk Map", url: "/stakeholder/risk", icon: Activity, roles: ["stakeholder"] },
  { title: "Hotspots", url: "/stakeholder/hotspots", icon: BarChart3, roles: ["stakeholder"] },
  { title: "Alert Review", url: "/stakeholder/alerts", icon: Bell, roles: ["stakeholder"] },
  { title: "Deliveries", url: "/stakeholder/deliveries", icon: Send, roles: ["stakeholder"] },
  { title: "Field Reports", url: "/stakeholder/reports", icon: ClipboardList, roles: ["stakeholder"] },
  { title: "Profile", url: "/stakeholder/profile", icon: UserCircle, roles: ["stakeholder"] },
];

const coordinatorNav: NavItem[] = [
  { title: "Dashboard", url: "/coordinator", icon: LayoutDashboard, roles: ["coordinator"] },
  { title: "My Areas", url: "/coordinator/areas", icon: MapPin, roles: ["coordinator"] },
  { title: "My Alerts", url: "/coordinator/alerts", icon: Bell, roles: ["coordinator"] },
  { title: "Draft Alert", url: "/coordinator/alerts/new", icon: FileText, roles: ["coordinator"] },
  { title: "Field Reports", url: "/coordinator/reports", icon: ClipboardList, roles: ["coordinator"] },
  { title: "Flood Event", url: "/coordinator/events/new", icon: AlertTriangle, roles: ["coordinator"] },
  { title: "Local Risk", url: "/coordinator/risk", icon: Activity, roles: ["coordinator"] },
  { title: "Profile", url: "/coordinator/profile", icon: UserCircle, roles: ["coordinator"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role } = useAuth();

  const renderNav = (items: NavItem[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={item.url === "/admin" || item.url === "/stakeholder" || item.url === "/coordinator"}
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
          <img src={afewsLogo} alt="A-FEWS" className="h-8 w-8 flex-shrink-0 object-contain" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-accent-foreground tracking-tight">A-FEWS</span>
              <span className="text-[10px] text-sidebar-muted leading-tight">Flood Early Warning · Ghana</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-hidden hover:overflow-y-auto scrollbar-thin">
        {role === "admin" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-muted">Operations</SidebarGroupLabel>
              <SidebarGroupContent><SidebarMenu>{renderNav(adminOpsNav)}</SidebarMenu></SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-muted">Management</SidebarGroupLabel>
              <SidebarGroupContent><SidebarMenu>{renderNav(adminMgmtNav)}</SidebarMenu></SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-muted">System</SidebarGroupLabel>
              <SidebarGroupContent><SidebarMenu>{renderNav(adminSysNav)}</SidebarMenu></SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        {role === "stakeholder" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted">Navigation</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>{renderNav(stakeholderNav)}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        )}
        {role === "coordinator" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted">Navigation</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>{renderNav(coordinatorNav)}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        {!collapsed && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <StatusIndicator status="active" label="System Online" className="text-sidebar-muted" />
              <span className="text-[10px] text-sidebar-muted font-mono">v0.3.0</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
