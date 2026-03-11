import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AuthShell } from "./Login";
import { authApi } from "@/lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") ?? searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    ref ? "loading" : "idle"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    (async () => {
      try {
        await authApi.verifyEmail(ref);
        if (!cancelled) setStatus("success");
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Verification failed. The link may have expired."
          );
          setStatus("error");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [ref]);

  if (status === "loading") {
    return (
      <AuthShell>
        <Card className="w-full max-w-md border-border/60 shadow-md text-center">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <CardTitle className="text-xl font-semibold">Verifying your email…</CardTitle>
          </CardHeader>
        </Card>
      </AuthShell>
    );
  }

  if (status === "success") {
    return (
      <AuthShell>
        <Card className="w-full max-w-md border-border/60 shadow-md text-center">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-status-active text-primary-foreground">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-semibold">Email verified</CardTitle>
            <CardDescription>
              Your email has been verified successfully. You can now log in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    );
  }

  if (status === "error") {
    return (
      <AuthShell>
        <Card className="w-full max-w-md border-border/60 shadow-md text-center">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-destructive text-destructive-foreground">
              <XCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-semibold">Verification failed</CardTitle>
            <CardDescription>
              {error ?? "The verification link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    );
  }

  // No ref in URL — show the "check your email" static page (post-registration)
  return (
    <AuthShell>
      <Card className="w-full max-w-md border-border/60 shadow-md text-center">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-status-active text-primary-foreground">
            <MailCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-semibold">Check your email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address. Click the link to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You won't be able to log in until your email is verified. If you don't see the email, check your spam folder.
          </p>
          <Button asChild className="w-full">
            <Link to="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
