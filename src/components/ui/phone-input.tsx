import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "TZ", name: "Tanzania", dial: "+255", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", dial: "+256", flag: "🇺🇬" },
  { code: "CI", name: "Côte d'Ivoire", dial: "+225", flag: "🇨🇮" },
  { code: "SN", name: "Senegal", dial: "+221", flag: "🇸🇳" },
  { code: "CM", name: "Cameroon", dial: "+237", flag: "🇨🇲" },
  { code: "ET", name: "Ethiopia", dial: "+251", flag: "🇪🇹" },
  { code: "RW", name: "Rwanda", dial: "+250", flag: "🇷🇼" },
  { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬" },
  { code: "BJ", name: "Benin", dial: "+229", flag: "🇧🇯" },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "🇧🇫" },
  { code: "ML", name: "Mali", dial: "+223", flag: "🇲🇱" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  className?: string;
  placeholder?: string;
  defaultCountry?: string;
  disabled?: boolean;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, placeholder, defaultCountry = "GH", disabled }, ref) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(
      () => COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0]
    );
    const [localNumber, setLocalNumber] = React.useState(() => {
      // Strip dial code from initial value
      if (value) {
        const country = COUNTRIES.find((c) => value.startsWith(c.dial));
        if (country) return value.slice(country.dial.length).trim();
      }
      return "";
    });
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    React.useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9\s]/g, "");
      setLocalNumber(raw);
      onChange(`${selectedCountry.dial}${raw.replace(/\s/g, "")}`);
    };

    const handleCountrySelect = (country: Country) => {
      setSelectedCountry(country);
      setDropdownOpen(false);
      onChange(`${country.dial}${localNumber.replace(/\s/g, "")}`);
    };

    return (
      <div ref={containerRef} className={cn("relative", className)}>
        <div className="flex rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background overflow-hidden">
          {/* Country selector */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 px-3 py-2 border-r border-input bg-muted/30 hover:bg-muted transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg leading-none">{selectedCountry.flag}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {/* Dial code display + number input */}
          <div className="flex items-center flex-1">
            <span className="pl-3 pr-1 text-sm text-muted-foreground font-medium select-none">
              {selectedCountry.dial}
            </span>
            <input
              ref={ref}
              type="tel"
              value={localNumber}
              onChange={handleNumberChange}
              placeholder={placeholder || "20 000 0000"}
              disabled={disabled}
              className="flex-1 py-2 pr-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-md">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                  country.code === selectedCountry.code && "bg-accent"
                )}
              >
                <span className="text-lg leading-none">{country.flag}</span>
                <span className="flex-1 truncate">{country.name}</span>
                <span className="text-muted-foreground text-xs">{country.dial}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput, COUNTRIES };
export type { Country };
