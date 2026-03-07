import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, MapPin, Phone, MessageCircle, CheckCircle2, Loader2, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import afewsLogo from "@/assets/afews-logo.png";

type Step = "phone" | "otp" | "areas" | "done";

interface AreaOption {
  id: string; name: string; city: string; riskLevel: "low" | "moderate" | "high" | "severe";
}

const AREAS: AreaOption[] = [
  { id: "a1", name: "Alajo", city: "Accra", riskLevel: "severe" },
  { id: "a2", name: "Nima", city: "Accra", riskLevel: "high" },
  { id: "a3", name: "Adabraka", city: "Accra", riskLevel: "moderate" },
  { id: "a4", name: "Osu", city: "Accra", riskLevel: "moderate" },
  { id: "a5", name: "Kaneshie", city: "Accra", riskLevel: "low" },
  { id: "a6", name: "Odawna", city: "Accra", riskLevel: "severe" },
  { id: "a7", name: "Ashaiman", city: "Tema", riskLevel: "moderate" },
  { id: "a8", name: "Ablekuma", city: "Accra", riskLevel: "low" },
  { id: "a9", name: "Madina", city: "Accra", riskLevel: "high" },
  { id: "a10", name: "Teshie", city: "Accra", riskLevel: "moderate" },
];

const riskBadgeVariant: Record<string, "critical" | "high" | "moderate" | "low"> = {
  severe: "critical", high: "high", moderate: "moderate", low: "low",
};

export default function PublicSubscribe() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [channels, setChannels] = useState<Set<"sms" | "whatsapp">>(new Set(["sms"]));
  const [otpCode, setOtpCode] = useState("");
  const [phoneToken, setPhoneToken] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setError(null);
    if (channels.size === 0) {
      setError("Please select at least one alert channel (SMS or WhatsApp)."); return;
    }
    if (!phone.trim() || !phone.startsWith("+")) {
      setError("Please enter your phone number in international format (e.g. +233…)."); return;
    }
    setIsLoading(true);
    try { await new Promise((r) => setTimeout(r, 1200)); setStep("otp"); }
    catch { setError("Failed to send verification code."); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (otpCode.length < 6) { setError("Please enter the full 6-digit code."); return; }
    setIsLoading(true);
    try { await new Promise((r) => setTimeout(r, 1000)); setPhoneToken("mock_token"); setStep("areas"); }
    catch { setError("Invalid verification code."); }
    finally { setIsLoading(false); }
  };

  const handleSubscribe = async () => {
    setError(null);
    if (selectedAreas.length === 0) { setError("Please select at least one area."); return; }
    setIsLoading(true);
    try { await new Promise((r) => setTimeout(r, 1200)); setStep("done"); }
    catch { setError("Subscription failed."); }
    finally { setIsLoading(false); }
  };

  const toggleArea = (id: string) => setSelectedAreas((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const stepIndicator = (
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
      {["Verify Phone", "Select Areas", "Confirmed"].map((label, i) => {
        const stepIdx = i === 0 ? (step === "phone" || step === "otp" ? "active" : "done") :
                        i === 1 ? (step === "areas" ? "active" : step === "done" ? "done" : "pending") :
                        step === "done" ? "active" : "pending";
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-6 ${stepIdx === "pending" ? "bg-border" : "bg-primary"}`} />}
            <div className={`flex items-center gap-1.5 ${stepIdx === "active" ? "text-foreground font-medium" : stepIdx === "done" ? "text-status-active" : ""}`}>
              <span className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-semibold ${
                stepIdx === "active" ? "bg-primary text-primary-foreground" :
                stepIdx === "done" ? "bg-status-active text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{stepIdx === "done" ? "✓" : i + 1}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <img src={afewsLogo} alt="A-FEWS Logo" className="h-8 w-8 object-contain" />
          <div>
            <h1 className="text-sm font-semibold tracking-tight">A-FEWS</h1>
            <p className="text-[10px] text-muted-foreground">Flood Early Warning System · Ghana</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {(step === "phone" || step === "otp") && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">Subscribe to Flood Alerts</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A-FEWS monitors flood risk across Ghana using AI and climate data. Subscribe to receive early warnings via SMS or WhatsApp.
            </p>
          </div>
        )}

        {stepIndicator}
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {step === "phone" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" /> How would you like to receive alerts?</h3>
              <p className="text-xs text-muted-foreground">You can select both SMS and WhatsApp. If you choose WhatsApp, ensure your number is registered with WhatsApp.</p>
              <div className="flex gap-3">
                {([{ value: "sms" as const, label: "SMS", icon: Phone }, { value: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle }]).map(({ value, label, icon: Icon }) => {
                  const selected = channels.has(value);
                  return (
                  <button key={value} onClick={() => setChannels(prev => { const next = new Set(prev); if (next.has(value)) next.delete(value); else next.add(value); return next; })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm transition-colors ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-muted"}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                  );
                })}
              </div>
              {channels.has("whatsapp") && (
                <div className="flex items-start gap-2 rounded-md bg-accent/50 border border-accent px-3 py-2">
                  <MessageCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">Make sure the phone number you provide is registered with WhatsApp to receive alerts via WhatsApp.</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> Your phone number</h3>
              <Input type="tel" placeholder="+233 20 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="max-w-xs" />
              <p className="text-xs text-muted-foreground">Enter in international format (e.g. +233…).</p>
            </div>
            <Button onClick={handleSendOtp} disabled={isLoading || !phone.trim()} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send verification code"}
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground rounded-md bg-muted px-3 py-2">
              A 6-digit code has been sent to <span className="font-medium text-foreground">{phone}</span> via {[...channels].map(c => c === "sms" ? "SMS" : "WhatsApp").join(" & ")}.
            </p>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Enter verification code</h3>
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>{Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleVerifyOtp} disabled={isLoading || otpCode.length < 6}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </Button>
              <Button variant="ghost" onClick={() => { setStep("phone"); setOtpCode(""); setError(null); }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Change number
              </Button>
            </div>
          </div>
        )}

        {step === "areas" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight">Select Areas to Monitor</h2>
              <p className="text-sm text-muted-foreground">Choose the neighbourhoods you want to receive flood alerts for.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AREAS.map((area) => (
                <button key={area.id} onClick={() => toggleArea(area.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md border text-left transition-colors ${
                    selectedAreas.includes(area.id) ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : "bg-card border-border hover:bg-muted/50"
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`h-4 w-4 rounded-sm border flex items-center justify-center transition-colors ${selectedAreas.includes(area.id) ? "bg-primary border-primary" : "border-input"}`}>
                      {selectedAreas.includes(area.id) && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div>
                      <span className="text-sm font-medium">{area.name}</span>
                      <span className="text-xs text-muted-foreground ml-1.5">{area.city}</span>
                    </div>
                  </div>
                  <Badge variant={riskBadgeVariant[area.riskLevel]} className="text-[10px]">{area.riskLevel}</Badge>
                </button>
              ))}
            </div>
            {selectedAreas.length > 0 && <p className="text-xs text-muted-foreground">{selectedAreas.length} area{selectedAreas.length !== 1 ? "s" : ""} selected</p>}
            <Button onClick={handleSubscribe} disabled={isLoading || selectedAreas.length === 0} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="text-center space-y-5 py-8">
            <div className="mx-auto w-14 h-14 rounded-full bg-status-active/10 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-status-active" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">You're Subscribed!</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                You'll receive flood alerts via {[...channels].map(c => c === "sms" ? "SMS" : "WhatsApp").join(" & ")} at <span className="font-medium text-foreground">{phone}</span> when risk levels reach HIGH or SEVERE.
              </p>
            </div>
            <div className="text-left max-w-sm mx-auto space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subscribed areas</p>
              <div className="space-y-1">
                {AREAS.filter((a) => selectedAreas.includes(a.id)).map((area) => (
                  <div key={area.id} className="flex items-center justify-between rounded-sm bg-muted/50 px-3 py-1.5 text-sm">
                    <span className="flex items-center gap-2"><MapPin className="h-3 w-3 text-muted-foreground" /> {area.name}</span>
                    <Badge variant={riskBadgeVariant[area.riskLevel]} className="text-[10px]">{area.riskLevel}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <Link to="/manage-subscription"><Button variant="outline">Manage my subscription</Button></Link>
            </div>
          </div>
        )}

        <div className="border-t border-border pt-6 mt-8 space-y-2">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <p>Your phone number is used solely for delivering flood alert notifications. We do not share your data with third parties. You can unsubscribe at any time.</p>
          </div>
          <p className="text-xs text-muted-foreground">Need help? Contact <span className="text-foreground font-medium">support@afews.org</span></p>
        </div>
      </div>
    </div>
  );
}
