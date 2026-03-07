import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Thermometer, Wind, Droplets, Eye, Gauge, Sun, CloudSun, Cloud, CloudFog, Loader2 } from "lucide-react";

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
    surface_pressure: number;
    cloud_cover: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    wind_speed_10m: number[];
    relative_humidity_2m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
}

const GHANA_COORDS = { lat: 5.6037, lon: -0.187 }; // Accra

function weatherIcon(code: number) {
  if (code <= 1) return <Sun className="h-5 w-5 text-severity-moderate" />;
  if (code <= 3) return <CloudSun className="h-5 w-5 text-muted-foreground" />;
  if (code <= 48) return <CloudFog className="h-5 w-5 text-muted-foreground" />;
  if (code <= 67) return <CloudRain className="h-5 w-5 text-severity-info" />;
  return <CloudRain className="h-5 w-5 text-severity-critical" />;
}

function weatherLabel(code: number) {
  if (code <= 0) return "Clear Sky";
  if (code <= 1) return "Mainly Clear";
  if (code <= 2) return "Partly Cloudy";
  if (code <= 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 55) return "Drizzle";
  if (code <= 57) return "Freezing Drizzle";
  if (code <= 61) return "Light Rain";
  if (code <= 63) return "Moderate Rain";
  if (code <= 65) return "Heavy Rain";
  if (code <= 67) return "Freezing Rain";
  if (code <= 75) return "Snowfall";
  if (code <= 77) return "Snow Grains";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  if (code <= 95) return "Thunderstorm";
  return "Severe Thunderstorm";
}

export function WeatherDashboard() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${GHANA_COORDS.lat}&longitude=${GHANA_COORDS.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,surface_pressure,cloud_cover&hourly=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Africa/Accra&forecast_days=7`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError("Unable to fetch weather data");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading weather data...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="panel text-center py-8 text-sm text-muted-foreground">{error || "No data"}</div>
    );
  }

  const { current, hourly, daily } = data;
  const next12h = hourly.time.slice(0, 12);
  const precipTotal24h = hourly.precipitation.slice(0, 24).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Current conditions hero */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="p-3 rounded-xl bg-primary/10 animate-pulse-subtle">
              {weatherIcon(current.weather_code)}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">{current.temperature_2m.toFixed(1)}°C</span>
                <Badge variant="outline" className="text-[10px]">{weatherLabel(current.weather_code)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Accra, Greater Accra Region · Live from Open-Meteo</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-severity-info" />
              <div>
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="text-sm font-semibold">{current.relative_humidity_2m}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Wind</p>
                <p className="text-sm font-semibold">{current.wind_speed_10m.toFixed(1)} km/h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-severity-high" />
              <div>
                <p className="text-xs text-muted-foreground">Rain Now</p>
                <p className="text-sm font-semibold">{current.precipitation.toFixed(1)} mm</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Pressure</p>
                <p className="text-sm font-semibold">{current.surface_pressure.toFixed(0)} hPa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Precipitation forecast bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-severity-info" />
            12-Hour Precipitation Forecast
            <Badge variant="outline" className="ml-auto text-[10px]">24h total: {precipTotal24h.toFixed(1)}mm</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {next12h.map((time, i) => {
              const val = hourly.precipitation[i];
              const maxP = Math.max(...hourly.precipitation.slice(0, 12), 1);
              const h = Math.max(4, (val / maxP) * 100);
              return (
                <div key={time} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm bg-severity-info/70 transition-all duration-700 ease-out"
                    style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                    title={`${val.toFixed(1)}mm`}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(time).getHours().toString().padStart(2, "0")}h
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 7 day forecast */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sun className="h-4 w-4 text-severity-moderate" />
            7-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {daily.time.map((day, i) => {
              const d = new Date(day);
              const dayName = i === 0 ? "Today" : d.toLocaleDateString("en-GH", { weekday: "short" });
              return (
                <div
                  key={day}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-md hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-xs font-medium">{dayName}</span>
                  {weatherIcon(daily.weather_code[i])}
                  <div className="text-center">
                    <span className="text-xs font-semibold">{daily.temperature_2m_max[i].toFixed(0)}°</span>
                    <span className="text-[10px] text-muted-foreground ml-0.5">{daily.temperature_2m_min[i].toFixed(0)}°</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <CloudRain className="h-2.5 w-2.5 text-severity-info" />
                    <span className="text-[10px] text-muted-foreground">{daily.precipitation_sum[i].toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hourly temp + wind curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-severity-high" />
              Temperature (Next 24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-0.5 h-20">
              {hourly.temperature_2m.slice(0, 24).map((temp, i) => {
                const minT = Math.min(...hourly.temperature_2m.slice(0, 24));
                const maxT = Math.max(...hourly.temperature_2m.slice(0, 24));
                const range = maxT - minT || 1;
                const h = Math.max(8, ((temp - minT) / range) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${temp.toFixed(1)}°C`}>
                    <div
                      className="w-full rounded-t-sm bg-severity-high/50 transition-all duration-500"
                      style={{ height: `${h}%` }}
                    />
                    {i % 4 === 0 && (
                      <span className="text-[8px] text-muted-foreground">{(new Date(hourly.time[i])).getHours()}h</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wind className="h-4 w-4 text-accent" />
              Wind Speed (Next 24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-0.5 h-20">
              {hourly.wind_speed_10m.slice(0, 24).map((ws, i) => {
                const maxW = Math.max(...hourly.wind_speed_10m.slice(0, 24), 1);
                const h = Math.max(4, (ws / maxW) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${ws.toFixed(1)} km/h`}>
                    <div
                      className="w-full rounded-t-sm bg-accent/50 transition-all duration-500"
                      style={{ height: `${h}%` }}
                    />
                    {i % 4 === 0 && (
                      <span className="text-[8px] text-muted-foreground">{(new Date(hourly.time[i])).getHours()}h</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
