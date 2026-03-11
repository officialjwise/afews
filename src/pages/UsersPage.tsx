import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Users, Shield, Mail, MoreVertical, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { AppRole, ROLE_META } from "@/lib/roles";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { userApi, type UserRecord } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  lastActive: string;
  status: "active" | "inactive";
}

function adaptUser(r: UserRecord): User {
  return {
    id: r.id,
    name: r.full_name,
    email: r.email,
    role: r.role.toLowerCase() as AppRole,
    lastActive: r.last_login_at
      ? new Date(r.last_login_at).toLocaleString()
      : new Date(r.created_at).toLocaleDateString(),
    status: r.is_active ? "active" : "inactive",
  };
}

const ROLE_OPTIONS = ["all", "admin", "coordinator", "stakeholder"] as const;
const STATUS_OPTIONS = ["all", "active", "inactive"] as const;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; role: AppRole }>({ name: "", email: "", role: "stakeholder" });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    userApi.list()
      .then((res) => {
        if (!cancelled) setUsers((res.data?.items ?? []).map(adaptUser));
      })
      .catch(() => toast.error("Failed to load users."))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleInvite = async () => {
    if (!newUser.email.trim() || !newUser.name.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setInviteLoading(true);
    try {
      const res = await userApi.invite({
        email: newUser.email.trim(),
        full_name: newUser.name.trim(),
        role: newUser.role.toUpperCase(),
      });
      setUsers((prev) => [adaptUser(res.data), ...prev]);
      toast.success(`Invitation sent to ${newUser.email}`);
      setIsInviteOpen(false);
      setNewUser({ name: "", email: "", role: "stakeholder" });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to send invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleEditRole = (user: User) => { setEditingUser(user); setIsEditOpen(true); };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setEditSaving(true);
    try {
      await userApi.updateRole(editingUser.id, editingUser.role.toUpperCase());
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setIsEditOpen(false); setEditingUser(null);
      toast.success("Role updated.");
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to update role.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!confirmUser) return;
    setToggling(true);
    try {
      const action = confirmUser.status === "active" ? userApi.deactivate : userApi.activate;
      const res = await action(confirmUser.id);
      const updated = adaptUser(res.data);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(
        confirmUser.status === "active"
          ? `${confirmUser.name} has been deactivated.`
          : `${confirmUser.name} has been activated.`,
      );
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to update user status.");
    } finally {
      setToggling(false);
      setConfirmUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<User>[] = [
    {
      key: "name", header: "Name", sortable: true, sortValue: (r) => r.name,
      render: (r) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {r.email}</p>
        </div>
      ),
    },
    {
      key: "role", header: "Role",
      render: (r) => {
        const meta = ROLE_META[r.role];
        return <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold ${meta.color}`}>{meta.label}</span>;
      },
    },
    {
      key: "status", header: "Status",
      render: (r) => (
        <Badge variant={r.status === "active" ? "secondary" : "outline"} className={r.status === "active" ? "bg-status-active/10 text-status-active hover:bg-status-active/20 border-0" : ""}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: "lastActive", header: "Last Active",
      render: (r) => <span className="text-xs text-muted-foreground">{r.lastActive}</span>,
    },
    {
      key: "actions", header: "", className: "w-10",
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreVertical className="h-3.5 w-3.5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEditRole(r)}><Edit className="mr-2 h-3.5 w-3.5" /> Edit role</DropdownMenuItem>
            <DropdownMenuItem
              className={r.status === "active" ? "text-destructive focus:text-destructive" : ""}
              onClick={() => setConfirmUser(r)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              {r.status === "active" ? "Deactivate" : "Activate"}
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

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Role:</span>
          {ROLE_OPTIONS.map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors border ${
                roleFilter === r ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}>
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors border ${
                statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        rowKey={(r) => r.id}
        pageSize={5}
        searchable
        searchKeys={["name", "email"] as any}
        emptyIcon={loading ? <Loader2 className="h-8 w-8 opacity-50 animate-spin" /> : <Users className="h-8 w-8 opacity-50" />}
        emptyMessage={loading ? "Loading users..." : "No users found"}
      />

      {/* Invite User Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>Send an invitation email to a new team member.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select value={newUser.role} onValueChange={(val: AppRole) => setNewUser({ ...newUser, role: val })}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)} disabled={inviteLoading}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviteLoading}>
              {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update role and permissions.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input id="edit-name" value={editingUser.name} disabled className="col-span-3 bg-muted" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">Role</Label>
                <Select value={editingUser.role} onValueChange={(val: AppRole) => setEditingUser({ ...editingUser, role: val })}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
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
            <Button onClick={handleUpdateUser} disabled={editSaving}>
              {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Deactivate/Activate Dialog */}
      <AlertDialog open={!!confirmUser} onOpenChange={(open) => { if (!open) setConfirmUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmUser?.status === "active" ? "Deactivate" : "Activate"} user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmUser?.status === "active"
                ? `This will deactivate ${confirmUser?.name}'s account and log them out of all sessions. They will not be able to sign in until re-activated.`
                : `This will re-activate ${confirmUser?.name}'s account, allowing them to sign in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleActive}
              disabled={toggling}
              className={confirmUser?.status === "active" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {toggling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {confirmUser?.status === "active" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
