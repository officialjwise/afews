import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Users, Shield, Mail, MoreVertical, Plus, Edit, Trash2, MapPin } from "lucide-react";
import { AppRole, ROLE_META } from "@/lib/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; role: AppRole }>({ name: "", email: "", role: "stakeholder" });
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleInvite = () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const user: User = {
      id: `u${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "active",
      lastActive: "Just now",
      assignedAreas: newUser.role === "coordinator" ? [] : undefined
    };

    setUsers([...users, user]);
    setIsInviteOpen(false);
    setNewUser({ name: "", email: "", role: "stakeholder" });
    toast.success("User invited successfully");
  };

  const handleEditRole = (user: User) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setIsEditOpen(false);
    setEditingUser(null);
    toast.success("User updated successfully");
  };

  const handleDeactivate = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: "inactive" } : u));
    toast.success("User deactivated");
  };

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
        <Badge variant={r.status === "active" ? "secondary" : "outline"} className={r.status === "active" ? "bg-status-active/10 text-status-active hover:bg-status-active/20 border-0" : ""}>
          {r.status}
        </Badge>
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
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditRole(r)}>
              <Edit className="mr-2 h-3.5 w-3.5" /> Edit role
            </DropdownMenuItem>
            {r.role === "coordinator" && (
              <DropdownMenuItem onClick={() => toast.info("Area assignment implementation pending")}>
                <MapPin className="mr-2 h-3.5 w-3.5" /> Assign areas
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeactivate(r.id)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Users & Roles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage staff accounts and role assignments</p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Invite User
        </Button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        rowKey={(r) => r.id}
        searchable
        searchKeys={["name", "email"] as any}
        emptyIcon={<Users className="h-8 w-8 opacity-50" />}
        emptyMessage="No users found"
      />

      {/* Invite User Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation email to a new team member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(val: AppRole) => setNewUser({ ...newUser, role: val })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update role and permissions.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input id="edit-name" value={editingUser.name} disabled className="col-span-3 bg-muted" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(val: AppRole) => setEditingUser({ ...editingUser, role: val })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="stakeholder">Stakeholder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}