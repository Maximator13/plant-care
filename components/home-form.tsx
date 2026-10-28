"use client";

import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { findCity, saveHome, type ActionState } from "@/app/actions";
import { Honeypot } from "@/components/honeypot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Home } from "@/db/schema";

type Place = { city: string; latitude: number; longitude: number; timezone: string };
type CityResult = Awaited<ReturnType<typeof findCity>>[number];

export function HomeForm({ home }: { home: Home | null }) {
  const [state, action, saving] = useActionState<ActionState, FormData>(saveHome, undefined);
  const [place, setPlace] = useState<Place | null>(
    home ? { city: home.city ?? "Position GPS", latitude: home.latitude, longitude: home.longitude, timezone: home.timezone } : null,
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[] | null>(null);
  const [searching, startSearch] = useTransition();
  const [geoError, setGeoError] = useState<string | null>(null);

  function locate() {
    setGeoError(null);
    if (!navigator.geolocation) return setGeoError("La géolocalisation n'est pas disponible sur cet appareil.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setPlace({
          city: "Position GPS",
          latitude: Number(coords.latitude.toFixed(4)),
          longitude: Number(coords.longitude.toFixed(4)),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      () => setGeoError("Position refusée ou introuvable. Cherche ta ville ci-dessous."),
    );
  }

  return (
    <form action={action} className="space-y-6">
      <Honeypot />
      <fieldset className="space-y-3">
        <legend className="font-serif text-lg font-semibold">Localisation de la maison</legend>
        <p className="text-sm text-muted-foreground">Elle sert à récupérer la météo locale et à déterminer la saison.</p>

        <Button type="button" variant="outline" onClick={locate}>
          <LocateFixed aria-hidden /> Utiliser ma position
        </Button>
        {geoError && <p className="text-sm text-destructive">{geoError}</p>}

        <div className="space-y-2">
          <Label htmlFor="city-search">Ou cherche ta ville</Label>
          <div className="flex gap-2">
            <Input
              id="city-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  startSearch(async () => setResults(await findCity(query)));
                }
              }}
              placeholder="Ex. Lyon"
              autoComplete="address-level2"
              className="h-11"
            />
            <Button type="button" variant="secondary" disabled={searching || query.trim().length < 2} onClick={() => startSearch(async () => setResults(await findCity(query)))}>
              {searching ? <Loader2 aria-hidden className="animate-spin" /> : null}
              Chercher
            </Button>
          </div>
          {results && results.length === 0 && <p className="text-sm text-muted-foreground">Aucune ville trouvée.</p>}
          {results && results.length > 0 && (
            <ul className="divide-y rounded-md border bg-card" aria-label="Résultats">
              {results.map((r) => (
                <li key={`${r.latitude},${r.longitude}`}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    onClick={() => {
                      setPlace({ city: r.name, latitude: r.latitude, longitude: r.longitude, timezone: r.timezone });
                      setResults(null);
                      setQuery("");
                    }}
                  >
                    <MapPin aria-hidden className="size-4 text-primary" /> {r.name}
                    <span className="text-muted-foreground">{r.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p aria-live="polite" className="rounded-md bg-muted p-3 text-sm">
          {place ? (
            <>
              <strong>{place.city}</strong>{" "}
              <span className="tabular text-muted-foreground">
                ({place.latitude.toFixed(2)}, {place.longitude.toFixed(2)} · {place.timezone})
              </span>
            </>
          ) : (
            "Aucune localisation choisie."
          )}
        </p>
        {place && (
          <>
            <input type="hidden" name="city" value={place.city} />
            <input type="hidden" name="latitude" value={place.latitude} />
            <input type="hidden" name="longitude" value={place.longitude} />
            <input type="hidden" name="timezone" value={place.timezone} />
          </>
        )}
      </fieldset>

      <div className="flex items-center justify-between gap-4 rounded-md border bg-card p-3">
        <Label htmlFor="emailAlerts" className="flex-1 leading-snug">
          Recevoir un email le matin quand une plante doit être arrosée
        </Label>
        <Switch id="emailAlerts" name="emailAlerts" value="on" defaultChecked={home?.emailAlerts ?? true} />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={!place || saving}>
        {saving && <Loader2 aria-hidden className="animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
}
