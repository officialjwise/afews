import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LockKeyhole, CheckCircle2 } from "lucide-react";
import { AuthShell } from "./Login";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!passwordValid) {
      setError("Password does not meet the requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      // TODO: POST /v1/auth/password/reset
      await new Promise((r) => setTimeout(r, 1200));
      setDone(true);
    } catch {
      setError("Failed to reset password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-border/60 shadow-md">
        <CardHeader className="space-y-1 text-center">
          <div className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md ${done ? "bg-status-active" : "bg-primary"} text-primary-foreground`}>
            {done ? <CheckCircle2 className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
          </div>
          <CardTitle className="text-xl font-semibold">
            {done ? "Password updated" : "Set new password"}
          </CardTitle>
          <CardDescription>
            {done
              ? "Your password has been reset. You can now log in."
              : "Choose a strong password for your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {done ? (
            <Button asChild className="w-full">
              <Link to="/login">Go to login</Link>
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li className={password.length >= 8 ? "text-status-active" : ""}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? "text-status-active" : ""}>
                    Uppercase and lowercase letters
                  </li>
                  <li className={/\d/.test(password) ? "text-status-active" : ""}>
                    At least one digit
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !passwordValid}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
}
