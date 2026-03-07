import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { Save, Loader2, CheckCircle2, User } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your account settings and preferences</p>
      </div>

      <div className="panel space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-secondary p-3">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Full name</Label>
            <Input defaultValue={user?.displayName || ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue={user?.email || ""} type="email" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Input value={user?.role || ""} disabled className="capitalize" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>New password</Label>
            <Input type="password" placeholder="Leave blank to keep current" />
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notification Preferences</h3>
          <div className="flex items-center justify-between">
            <Label className="font-normal">Email notifications</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-normal">System alerts</Label>
            <Switch defaultChecked />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
           saved ? <><CheckCircle2 className="h-3.5 w-3.5" /> Saved</> :
           <><Save className="h-3.5 w-3.5" /> Save changes</>}
        </Button>
      </div>
    </div>
  );
}
