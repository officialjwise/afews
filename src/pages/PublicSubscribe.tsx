import { useState } from "react";
import { Shield, Bell, MapPin, Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const areas = [
  "Makoko", "Lekki Phase 1", "Victoria Island", "Surulere",
  "Ajegunle", "Ikoyi", "Yaba", "Ikeja", "Mushin", "Apapa",
];

export default function PublicSubscribe() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const [submitted, setSubmitted] = useState(false);

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-status-active/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-status-active" />
          </div>
          <h1 className="text-xl font-semibold">You're Subscribed</h1>
          <p className="text-sm text-muted-foreground">
            You'll receive flood alerts for {selectedAreas.length} area{selectedAreas.length !== 1 ? "s" : ""} via {channel === "sms" ? "SMS" : "WhatsApp"}.
          </p>
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Modify subscription
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-sm font-semibold tracking-tight">A-FEWS</h1>
            <p className="text-[10px] text-muted-foreground">Flood Early Warning System</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Intro */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Subscribe to Flood Alerts
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Receive early warning notifications when flood risk is elevated in your area. 
            Alerts are sent via SMS or WhatsApp based on real-time climate and terrain analysis.
          </p>
        </div>

        {/* Step 1: Select areas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Select your areas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => toggleArea(area)}
                className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
                  selectedAreas.includes(area)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
          {selectedAreas.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedAreas.length} area{selectedAreas.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {/* Step 2: Channel */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Notification channel</h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setChannel("sms")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm transition-colors ${
                channel === "sms"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-muted"
              }`}
            >
              <Phone className="h-4 w-4" />
              SMS
            </button>
            <button
              onClick={() => setChannel("whatsapp")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm transition-colors ${
                channel === "whatsapp"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-muted"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Step 3: Phone */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Your phone number</h3>
          </div>
          <Input
            type="tel"
            placeholder="+234 800 000 0000"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Your number is used only for flood alerts and is never shared.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            onClick={() => setSubmitted(true)}
            disabled={selectedAreas.length === 0}
            className="w-full sm:w-auto"
          >
            Subscribe to Alerts
          </Button>
        </div>
      </div>
    </div>
  );
}
