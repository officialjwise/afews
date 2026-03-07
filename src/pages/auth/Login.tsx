import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, ShieldCheck, Mail } from "lucide-react";

type Step = "email" | "credentials";

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setCodeSent(true);
      setStep("credentials");
    } catch { setError("Failed to send verification code. Please try again."); }
    finally { setIsLoading(false); }
  };

  const handleLogin = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!password) { setError("Please enter your password."); return; }
    if (otpCode.length < 6) { setError("Please enter the 6-digit code sent to your phone."); return; }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      // On success: redirect to dashboard
      navigate("/dashboard");
    } catch { setError("Invalid credentials or verification code."); }
    finally { setIsLoading(false); }
  }, [password, otpCode]);

  // Auto-submit when OTP is complete and password is filled
  useEffect(() => {
    if (otpCode.length === 6 && password && step === "credentials") {
      handleLogin();
    }
  }, [otpCode, password, step, handleLogin]);

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-border/60 shadow-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-semibold">Staff Login</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Enter your email to receive a verification code"
              : "Enter your password and the code sent to your phone"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "email" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@organisation.org" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Mail className="h-4 w-4" /> Send code to my phone</>)}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {codeSent && (
                <p className="text-sm text-muted-foreground rounded-md bg-muted px-3 py-2">
                  A 6-digit code has been sent to the phone number linked to <span className="font-medium text-foreground">{email}</span>.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
              </div>

              <div className="space-y-2">
                <Label>Verification code</Label>
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-xs text-muted-foreground">Code will auto-verify once all 6 digits are entered.</p>
              </div>

              {isLoading && <div className="flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
              </Button>

              <button type="button"
                onClick={() => { setStep("email"); setOtpCode(""); setPassword(""); setError(null); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Use a different email
              </button>
            </form>
          )}

          <div className="mt-6 space-y-2 text-center text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">Register</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

/** Shared layout wrapper for all auth pages */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">A-FEWS</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-Powered Flood Early Warning System</p>
      </div>
      {children}
    </div>
  );
}
