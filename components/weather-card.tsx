import { CloudOff, CloudRain, Flame, Snowflake, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SEASON_LABEL_FR, type Season } from "@/lib/season";
import type { WeatherContext } from "@/lib/weather";

export function WeatherCard({ weather, season }: { weather: WeatherContext | null; season: Season }) {
  if (!weather) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 text-muted-foreground">
          <CloudOff aria-hidden className="size-5 shrink-0" />
          <p>
            {SEASON_LABEL_FR[season]} · Météo indisponible pour le moment. Le calcul d&apos;arrosage reste basé sur la
            saison.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-serif text-lg font-semibold">{SEASON_LABEL_FR[weather.season]}</span>
          {weather.tempMinC !== null && weather.tempMaxC !== null && (
            <span className="tabular inline-flex items-center gap-1">
              <Thermometer aria-hidden className="size-4" />
              {Math.round(weather.tempMinC)}–{Math.round(weather.tempMaxC)} °C
            </span>
          )}
          <span className="tabular inline-flex items-center gap-1">
            <CloudRain aria-hidden className="size-4" />
            {Math.round(weather.rain48hMm)} mm sur 48 h
          </span>
        </div>
        <p className="text-sm">{weather.summary}</p>
        {(weather.heatwave || weather.frostRisk) && (
          <div className="flex flex-wrap gap-2">
            {weather.heatwave && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                <Flame aria-hidden className="size-3.5" /> Vague de chaleur
              </span>
            )}
            {weather.frostRisk && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground">
                <Snowflake aria-hidden className="size-3.5" /> Risque de gel
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
