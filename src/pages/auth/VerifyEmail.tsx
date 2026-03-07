import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";
import { AuthShell } from "./Login";

export default function VerifyEmail() {
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
