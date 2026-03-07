import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Users, Shield, Mail, MoreVertical } from "lucide-react";
import { AppRole, ROLE_META } from "@/lib/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  assignedAreas?: string[];
  lastActive: string;
  status: "active" | "inactive";
}

const MOCK_USERS: User[] = [
  { id: "u1", name: "Adaeze Okonkwo", email: "admin@afews.org", role: "admin", lastActive: "2 min ago", status: "active" },
  { id: "u2", name: "Dr. Ibrahim Musa", email: "stakeholder@nema.gov.ng", role: "stakeholder", lastActive: "1h ago", status: "active" },
  { id: "u3", name: "Chidi Nwosu", email: "coordinator@afews.org", role: "coordinator", assignedAreas: ["Makoko", "Ajegunle"], lastActive: "30 min ago", status: "active" },
  { id: "u4", name: "Amina Bello", email: "amina@afews.org", role: "coordinator", assignedAreas: ["Lekki Phase 1"], lastActive: "3d ago", status: "inactive" },
  { id: "u5", name: "Emeka Obi", email: "emeka@nema.gov.ng", role: "stakeholder", lastActive: "5h ago", status: "active" },
];

const columns: Column<User>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    sortValue: (r) => r.name,
    render: (r) => (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{r.name}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {r.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (r) => {
      const meta = ROLE_META[r.role];
      return <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${meta.color}`}>{meta.label}</span>;
    },
  },
  {
    key: "areas",
    header: "Assigned Areas",
    render: (r) => r.assignedAreas ? (
      <div className="flex gap-1 flex-wrap">
        {r.assignedAreas.map((a) => (
          <span key={a} className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px]">{a}</span>
        ))}
      </div>
    ) : <span className="text-xs text-muted-foreground">—</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <Badge variant={r.status === "active" ? "low" : "moderate"}>{r.status}</Badge>
    ),
  },
  {
    key: "lastActive",
    header: "Last Active",
    render: (r) => <span className="text-xs text-muted-foreground">{r.lastActive}</span>,
  },
  {
    key: "actions",
    header: "",
    className: "w-10",
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Edit role</DropdownMenuItem>
          <DropdownMenuItem>Assign areas</DropdownMenuItem>
          <DropdownMenuItem className="text-severity-critical">Deactivate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function UsersPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage staff accounts and role assignments</p>
        </div>
        <Button><Users className="h-4 w-4" /> Invite User</Button>
      </div>

      <DataTable
        data={MOCK_USERS}
        columns={columns}
        rowKey={(r) => r.id}
        searchable
        searchKeys={["name", "email"] as any}
        emptyIcon={<Users className="h-8 w-8 opacity-50" />}
        emptyMessage="No users found"
      />
    </div>
  );
}
