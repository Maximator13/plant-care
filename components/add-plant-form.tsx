"use client";

import { Camera, Check, Globe, Loader2, PencilLine, Search } from "lucide-react";
import { useActionState, useMemo, useRef, useState, useTransition } from "react";
import { addPlant, findPerenualSpecies, identifyFromPhoto, type ActionState } from "@/app/actions";
import { Honeypot } from "@/components/honeypot";
import { PlantArt, genericArt } from "@/components/plant-art";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCatalogPlant, searchCatalog, type CatalogPlant } from "@/lib/catalog";
import type { Identification } from "@/lib/plantnet";
import type { SpeciesHit } from "@/lib/perenual";
import { cn } from "@/lib/utils";

type Choice =
  | { kind: "catalog"; plant: CatalogPlant }
  | { kind: "perenual"; id: number; name: string }
  | { kind: "manual"; name: string };

const WATER = [
  { value: "3", label: "Souvent", hint: "tous les 2-3 jours" },
  { value: "7", label: "Normal", hint: "chaque semaine" },
  { value: "14", label: "Peu", hint: "toutes les 2 semaines" },
  { value: "21", label: "Très peu", hint: "cactus, succulentes" },
];
const LIGHT = [
  { value: "sun", label: "Soleil" },
  { value: "partial", label: "Mi-ombre" },
  { value: "shade", label: "Ombre" },
];

/** Resizes a camera photo to a ~1024 px JPEG so it stays well under the 1 MB Server Action limit. */
async function toJpeg(file: File, max = 1024): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("conversion impossible"))), "image/jpeg", 0.82),
  );
}

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
        selected && "bg-muted",
      )}
    >
      {children}
      {selected && <Check aria-hidden className="ml-auto size-4 shrink-0 text-primary" />}
    </button>
  );
}

const sameChoice = (a: Choice | null, b: Choice) =>
  a?.kind === b.kind &&
  (b.kind === "catalog" ? a.kind === "catalog" && a.plant.slug === b.plant.slug : b.kind === "perenual" ? a.kind === "perenual" && a.id === b.id : true);

export function AddPlantForm() {
  const [state, action, saving] = useActionState<ActionState, FormData>(addPlant, undefined);
  const [query, setQuery] = useState("");
  const [choice, setChoice] = useState<Choice | null>(null);
  const [nickname, setNickname] = useState("");
  const [location, setLocation] = useState("indoor");
  const [perenual, setPerenual] = useState<{ hits: SpeciesHit[]; error: boolean } | null>(null);
  const [photo, setPhoto] = useState<{ results: Identification[]; error?: string } | null>(null);
  const [searching, startSearch] = useTransition();
  const [identifying, startIdentify] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const catalogHits = useMemo(() => searchCatalog(query), [query]);

  function choose(c: Choice) {
    setChoice(c);
    setNickname((n) => n || (c.kind === "catalog" ? c.plant.name : c.name));
    if (c.kind === "catalog") setLocation(c.plant.place === "outdoor" ? "outdoor" : "indoor");
  }

  function onPhoto(file: File | undefined) {
    if (!file) return;
    startIdentify(async () => {
      try {
        const body = new FormData();
        body.set("photo", await toJpeg(file), "plante.jpg");
        const res = await identifyFromPhoto(body);
        setPhoto(res);
        const best = res.results[0];
        const plant = best?.catalogSlug ? getCatalogPlant(best.catalogSlug) : undefined;
        if (plant && best.confidence >= 30) choose({ kind: "catalog", plant });
      } catch {
        setPhoto({ results: [], error: "Impossible de lire cette photo." });
      }
    });
  }

  return (
    <form action={action} className="space-y-6">
      <Honeypot />
      <fieldset className="space-y-3">
        <legend className="font-serif text-lg font-semibold">1. Quelle plante ?</legend>

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => onPhoto(e.target.files?.[0])}
        />
        <Button type="button" variant="outline" disabled={identifying} onClick={() => fileInput.current?.click()}>
          {identifying ? <Loader2 aria-hidden className="animate-spin" /> : <Camera aria-hidden />}
          {identifying ? "Identification…" : "Reconnaître avec une photo"}
        </Button>
        {photo?.error && <p role="status" className="text-sm text-muted-foreground">{photo.error}</p>}
        {photo && photo.results.length > 0 && (
          <ul className="divide-y rounded-md border bg-card" aria-label="Plantes reconnues sur la photo">
            {photo.results.map((r) => {
              const plant = r.catalogSlug ? getCatalogPlant(r.catalogSlug) : undefined;
              const c: Choice = plant ? { kind: "catalog", plant } : { kind: "manual", name: r.commonName ?? r.scientificName };
              return (
                <li key={r.scientificName}>
                  <OptionButton selected={sameChoice(choice, c)} onClick={() => choose(c)}>
                    {plant && <PlantArt art={plant.art} label="" className="size-10" />}
                    <span>
                      <span className="font-medium">{plant?.name ?? r.commonName ?? r.scientificName}</span>
                      <span className="block text-xs text-muted-foreground">
                        <em>{r.scientificName}</em> · {r.confidence} % {plant ? "· dans le catalogue" : "· profil à choisir"}
                      </span>
                    </span>
                  </OptionButton>
                </li>
              );
            })}
          </ul>
        )}

        <div className="relative">
          <Label htmlFor="species-search" className="sr-only">Rechercher une plante</Label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="species-search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPerenual(null);
            }}
            placeholder="Ou cherche : monstera, basilic, rosier…"
            className="h-11 pl-9"
            autoComplete="off"
          />
        </div>

        {catalogHits.length > 0 && (
          <ul className="divide-y rounded-md border bg-card" aria-label="Plantes du catalogue">
            {catalogHits.map((plant) => {
              const c: Choice = { kind: "catalog", plant };
              return (
                <li key={plant.slug}>
                  <OptionButton selected={sameChoice(choice, c)} onClick={() => choose(c)}>
                    <PlantArt art={plant.art} label="" className="size-10" />
                    <span>
                      <span className="font-medium">{plant.name}</span>
                      <span className="block text-xs text-muted-foreground italic">{plant.scientific}</span>
                    </span>
                  </OptionButton>
                </li>
              );
            })}
          </ul>
        )}

        {query.trim().length >= 3 && (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" disabled={searching} onClick={() => startSearch(async () => setPerenual(await findPerenualSpecies(query)))}>
              {searching ? <Loader2 aria-hidden className="animate-spin" /> : <Globe aria-hidden />}
              Recherche étendue
            </Button>
            <Button type="button" variant="ghost" aria-pressed={choice?.kind === "manual"} onClick={() => choose({ kind: "manual", name: query.trim() })}>
              <PencilLine aria-hidden /> Ajouter « {query.trim()} » moi-même
            </Button>
          </div>
        )}
        {perenual?.error && <p className="text-sm text-muted-foreground">La base Perenual est indisponible pour le moment.</p>}
        {perenual && !perenual.error && perenual.hits.length === 0 && <p className="text-sm text-muted-foreground">Aucun résultat sur Perenual.</p>}
        {perenual && perenual.hits.length > 0 && (
          <ul className="divide-y rounded-md border bg-card" aria-label="Résultats Perenual">
            {perenual.hits.map((h) => {
              const c: Choice = { kind: "perenual", id: h.perenualId, name: h.scientificName ? `${h.commonName} (${h.scientificName})` : h.commonName };
              return (
                <li key={h.perenualId}>
                  <OptionButton selected={sameChoice(choice, c)} onClick={() => choose(c)}>
                    <span>
                      <span className="font-medium capitalize">{h.commonName}</span>
                      {h.scientificName && <span className="block text-xs text-muted-foreground italic">{h.scientificName}</span>}
                    </span>
                  </OptionButton>
                </li>
              );
            })}
          </ul>
        )}

        {choice && (
          <div aria-live="polite" className="flex items-center gap-3 rounded-md bg-muted p-3 text-sm">
            <PlantArt art={choice.kind === "catalog" ? choice.plant.art : genericArt(7)} label="" className="size-12" />
            <span>
              Plante choisie : <strong>{choice.kind === "catalog" ? choice.plant.name : choice.name}</strong>
              {choice.kind !== "catalog" && <span className="block text-muted-foreground">Indique son besoin en eau et son exposition ci-dessous.</span>}
            </span>
          </div>
        )}
        {choice?.kind === "catalog" && (
          <>
            <input type="hidden" name="source" value="catalog" />
            <input type="hidden" name="slug" value={choice.plant.slug} />
          </>
        )}
        {choice?.kind === "perenual" && (
          <>
            <input type="hidden" name="source" value="perenual" />
            <input type="hidden" name="perenualId" value={choice.id} />
            <input type="hidden" name="speciesName" value={choice.name} />
          </>
        )}
        {choice?.kind === "manual" && (
          <div className="space-y-1.5">
            <input type="hidden" name="source" value="manual" />
            <Label htmlFor="species-name">Nom de la plante</Label>
            <Input id="species-name" name="speciesName" defaultValue={choice.name} key={choice.name} maxLength={160} className="h-11" />
          </div>
        )}
      </fieldset>

      {choice && choice.kind !== "catalog" && (
        <fieldset className="space-y-3">
          <legend className="font-serif text-lg font-semibold">Besoins de la plante</legend>
          <p className="text-sm font-medium">Arrosage</p>
          <RadioGroup name="waterDays" defaultValue="7" className="grid grid-cols-2 gap-2">
            {WATER.map((o) => (
              <Label key={o.value} htmlFor={`w-${o.value}`} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border bg-card px-3 has-[[data-state=checked]]:border-primary">
                <RadioGroupItem id={`w-${o.value}`} value={o.value} />
                <span>
                  {o.label}
                  <span className="block text-xs font-normal text-muted-foreground">{o.hint}</span>
                </span>
              </Label>
            ))}
          </RadioGroup>
          <p className="text-sm font-medium">Exposition</p>
          <RadioGroup name="light" defaultValue="partial" className="grid grid-cols-3 gap-2">
            {LIGHT.map((o) => (
              <Label key={o.value} htmlFor={`l-${o.value}`} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-md border bg-card px-3 has-[[data-state=checked]]:border-primary">
                <RadioGroupItem id={`l-${o.value}`} value={o.value} />
                {o.label}
              </Label>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      <fieldset className="space-y-3">
        <legend className="font-serif text-lg font-semibold">2. Emplacement</legend>
        <RadioGroup name="location" value={location} onValueChange={setLocation} className="grid grid-cols-2 gap-3">
          {[
            { value: "indoor", label: "Intérieur" },
            { value: "outdoor", label: "Extérieur" },
          ].map((o) => (
            <Label key={o.value} htmlFor={`loc-${o.value}`} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border bg-card px-3 has-[[data-state=checked]]:border-primary">
              <RadioGroupItem id={`loc-${o.value}`} value={o.value} />
              {o.label}
            </Label>
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-serif text-lg font-semibold">3. Surnom</legend>
        <Label htmlFor="nickname" className="sr-only">Surnom</Label>
        <Input id="nickname" name="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={60} required className="h-11" />
      </fieldset>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={!choice || saving}>
        {saving && <Loader2 aria-hidden className="animate-spin" />}
        Ajouter la plante
      </Button>
    </form>
  );
}
