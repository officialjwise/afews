import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Shield, Phone, MessageCircle, CheckCircle2, Loader2, ArrowLeft, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { authApi, areaApi, subscriptionApi, type AreaOption as ApiArea, type AreaRisk, type SubscriptionManageData, ApiError } from "@/lib/api";

const riskBadgeVariant: Record<string, "critical" | "high" | "moderate" | "low"> = {
  SEVERE: "critical", severe: "critical",
  HIGH: "high",     high: "high",
  MODERATE: "moderate", moderate: "moderate",
  LOW: "low",       low: "low",
};

type Step = "verify" | "otp" | "manage";

export default function ManageSubscription() {
  const [step, setStep] = useState<Step>("verify");
  const [phone, setPhone] = useState("");
  const [channels, setChannels] = useState<Set<"sms" | "whatsapp">>(new Set(["sms"]));
  const [otpCode, setOtpCode] = useState("");
  const [phoneToken, setPhoneToken] = useState<string | null>(null);
  const [subscribedAreas, setSubscribedAreas] = useState<string[]>([]);
  const [areas, setAreas] = useState<ApiArea[]>([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [subData, setSubData] = useState<SubscriptionManageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optOutDialog, setOptOutDialog] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch available areas on mount — public endpoint, no auth required
  useEffect(() => {
    setAreasLoading(true);
    areaApi.listPublic()
      .then((res) => setAreas(res.data ?? []))
      .catch(() => { /* silently ignore — user sees empty grid */ })
      .finally(() => setAreasLoading(false));
  }, []);

  const handleSendOtp = async () => {
    setError(null);
    if (channels.size === 0) { setError("Please select at least one alert channel."); return; }
    if (!phone || phone.length < 6) { setError("Please enter a valid phone number."); return; }
    setIsLoading(true);
    try {
      const channel = channels.has("whatsapp") ? "whatsapp" : "sms";
      await authApi.requestOtp(phone, channel);
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many requests. Please wait a moment before trying again.");
      } else {
        setError("Failed to send verification code. Please check your number and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    setError(null);
    if (otpCode.length < 6) { setError("Please enter the full 6-digit code."); return; }
    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(phone, otpCode);
      const token = res.data.otp_token;
      setPhoneToken(token);

      // Load existing subscription data
      try {
        const subRes = await subscriptionApi.getManageView(phone, token);
        const data = subRes.data;
        setSubData(data);
        setSubscribedAreas(data.areas.map((a: AreaRisk) => a.area_id));
      } catch {
        // No active subscription is fine — user can still manage
        setSubData(null);
        setSubscribedAreas([]);
      }

      setStep("manage");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Please wait before trying again.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Invalid or expired code. Please request a new one.");
        setOtpCode("");
      } else {
        setError("Verification failed. Please try again.");
        setOtpCode("");
      }
    } finally {
      setIsLoading(false);
    }
  }, [otpCode, phone]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otpCode.length === 6 && step === "otp") {
      handleVerifyOtp();
    }
  }, [otpCode, step, handleVerifyOtp]);

  const toggleArea = (id: string) => {
    setSubscribedAreas((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
    setSaved(false);
  };

  const handleUpdateAreas = async () => {
    if (!phoneToken) return;
    setIsLoading(true);
    setError(null);
    try {
      // Use the actual subscription channels from the loaded data, not the
      // channel chosen for OTP delivery. A user may have subscribed via
      // WHATSAPP but chosen SMS to receive the verification code.
      const activeChannels: string[] = subData?.channels?.length
        ? subData.channels
        : [channels.has("whatsapp") ? "WHATSAPP" : "SMS"];

      // Update areas for every channel sequentially (same phone_token is
      // valid across calls since the backend now uses _peek_phone_otp).
      for (const ch of activeChannels) {
        await subscriptionApi.updateAreas({
          phone,
          channel: ch,
          phone_token: phoneToken,
          area_ids: subscribedAreas,
        });
      }
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Your session has expired. Please verify your phone again.");
        setStep("verify");
      } else {
        setError("Failed to update areas. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptOut = async () => {
    if (!phoneToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const activeChannels = subData?.channels.length
        ? subData.channels
        : Array.from(channels as Set<string>);
      await Promise.all(
        activeChannels.map((ch) =>
          subscriptionApi.optOut({ phone, channel: ch, phone_token: phoneToken! })
        )
      );
      setOptOutDialog(false);
      setStep("verify");
      setPhone("");
      setOtpCode("");
      setPhoneToken(null);
      setSubData(null);
      setSubscribedAreas([]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Your session has expired. Please verify your phone again.");
        setOptOutDialog(false);
        setStep("verify");
      } else {
        setError("Failed to unsubscribe. Please try again.");
        setOptOutDialog(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-sm font-semibold tracking-tight">A-FEWS</h1>
            <p className="text-[10px] text-muted-foreground">Flood Early Warning System</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Manage Subscription</h2>
          <p className="text-sm text-muted-foreground">
            {step === "manage" ? "Update your subscribed areas or unsubscribe." : "Verify your phone number to access your subscription."}
          </p>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {step === "verify" && (
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Select one or both channels. If choosing WhatsApp, ensure your number is registered with WhatsApp.</p>
              <div className="flex gap-3">
                {([
                  { value: "sms" as const, label: "SMS", icon: Phone },
                  { value: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
                ]).map(({ value, label, icon: Icon }) => {
                  const selected = channels.has(value);
                  return (
                    <button key={value}
                      onClick={() => setChannels(prev => { const next = new Set(prev); if (next.has(value)) next.delete(value); else next.add(value); return next; })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted"}`}>
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  );
                })}
              </div>
              {channels.has("whatsapp") && (
                <div className="flex items-start gap-2 rounded-md bg-accent/50 border border-accent px-3 py-2">
                  <MessageCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">Make sure your phone number is registered with WhatsApp to receive alerts.</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <PhoneInput value={phone} onChange={setPhone} className="max-w-sm" defaultCountry="GH" />
            </div>
            <Button onClick={handleSendOtp} disabled={isLoading || !phone.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send verification code"}
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground rounded-md bg-muted px-3 py-2">
              Code sent to <span className="font-medium text-foreground">{phone}</span>
            </p>
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-muted-foreground">Code will auto-verify once all 6 digits are entered.</p>
            <div className="flex gap-3">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              <Button variant="ghost" onClick={() => { setStep("verify"); setOtpCode(""); }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            </div>
          </div>
        )}

        {step === "manage" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Your subscribed areas</h3>
              {areasLoading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
              {!areasLoading && areas.length === 0 && <p className="text-sm text-muted-foreground">No areas available. Please try again later.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {areas.map((area) => {
                  const riskData = subData?.areas.find((a) => a.area_id === area.id);
                  const riskLevel = riskData?.risk_level ?? null;
                  return (
                    <button key={area.id} onClick={() => toggleArea(area.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-md border text-left transition-colors ${subscribedAreas.includes(area.id) ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : "bg-card border-border hover:bg-muted/50"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`h-4 w-4 rounded-sm border flex items-center justify-center ${subscribedAreas.includes(area.id) ? "bg-primary border-primary" : "border-input"}`}>
                          {subscribedAreas.includes(area.id) && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm font-medium">{area.name}</span>
                      </div>
                      {riskLevel && (
                        <Badge variant={riskBadgeVariant[riskLevel]} className="text-[10px]">{riskLevel.toLowerCase()}</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleUpdateAreas} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? (<><CheckCircle2 className="h-4 w-4" /> Saved</>) : "Update areas"}
              </Button>
              <Button variant="outline" className="text-severity-critical hover:text-severity-critical" onClick={() => setOptOutDialog(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Unsubscribe
              </Button>
            </div>
            <Link to="/subscribe" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to subscribe page
            </Link>
          </div>
        )}

        <div className="border-t border-border pt-6 mt-8 text-xs text-muted-foreground flex items-start gap-2">
          <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <p>Your data is used solely for flood alert delivery. Contact <span className="text-foreground font-medium">support@afews.org</span> for help.</p>
        </div>
      </div>

      <Dialog open={optOutDialog} onOpenChange={setOptOutDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Unsubscribe from alerts?</DialogTitle>
            <DialogDescription>You will stop receiving all flood alerts. You can re-subscribe at any time.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOptOutDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleOptOut} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unsubscribe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
