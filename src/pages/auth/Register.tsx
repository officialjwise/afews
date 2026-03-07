import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { AuthShell } from "./Login";
import { PhoneInput } from "@/components/ui/phone-input";

type Step = "phone" | "verify" | "details";

export default function Register() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone || phone.length < 6) { setError("Please enter a valid phone number."); return; }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setStep("verify");
    } catch { setError("Failed to send verification code."); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = useCallback(async () => {
    setError(null);
    if (otpCode.length < 6) { setError("Please enter the full 6-digit code."); return; }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setStep("details");
    } catch { setError("Invalid verification code."); }
    finally { setIsLoading(false); }
  }, [otpCode]);

  // Auto-verify OTP
  useEffect(() => {
    if (otpCode.length === 6 && step === "verify") {
      handleVerifyOtp();
    }
  }, [otpCode, step, handleVerifyOtp]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName || !email || !password || !role) { setError("Please fill in all fields."); return; }
    if (!passwordValid) { setError("Password must be at least 8 characters with uppercase, lowercase, and a digit."); return; }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      window.location.href = "/verify-email";
    } catch { setError("Registration failed. Please try again."); }
    finally { setIsLoading(false); }
  };

  const stepLabels: Record<Step, string> = {
    phone: "Step 1 of 3 — Verify phone",
    verify: "Step 2 of 3 — Enter code",
    details: "Step 3 of 3 — Your details",
  };

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-border/60 shadow-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-semibold">Create Account</CardTitle>
          <CardDescription>{stepLabels[step]}</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "phone" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <PhoneInput value={phone} onChange={setPhone} defaultCountry="GH" />
                <p className="text-xs text-muted-foreground">We'll send a 6-digit code to verify your phone.</p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send verification code"}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground rounded-md bg-muted px-3 py-2">
                Enter the 6-digit code sent to <span className="font-medium text-foreground">{phone}</span>
              </p>
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
              <button type="button"
                onClick={() => { setStep("phone"); setOtpCode(""); setError(null); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Change phone number
              </button>
            </div>
          )}

          {step === "details" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoFocus required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regEmail">Email address</Label>
                <Input id="regEmail" type="email" placeholder="you@organisation.org" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regPassword">Password</Label>
                <Input id="regPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li className={password.length >= 8 ? "text-status-active" : ""}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? "text-status-active" : ""}>Uppercase and lowercase letters</li>
                  <li className={/\d/.test(password) ? "text-status-active" : ""}>At least one digit</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="stakeholder">Stakeholder</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Admin accounts are provisioned by system administrators.</p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !passwordValid}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
