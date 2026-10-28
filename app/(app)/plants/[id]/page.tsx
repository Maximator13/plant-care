import type { Metadata } from "next";
import { AlertTriangle, Archive, CloudRain, Droplets, House, Lightbulb, Trees } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { DeleteLogButton } from "@/components/delete-log-button";
import { artFor, PlantArt } from "@/components/plant-art";
import { PlantSettingsForm } from "@/components/plant-settings-form";
import { PlantStatus } from "@/components/plant-status";
import { WateringForm } from "@/components/watering-form";
import { adviceForPlant } from "@/lib/plant-advice";
import { getOwnedPlant, listWateringLogs, requireUserId } from "@/lib/plants";
import { wateringStatus } from "@/lib/watering";

export const metadata: Metadata = {
  title: "Fiche plante",
  description: "Historique d'arrosage, conseils d'entretien et réglages de la plante.",
};

export default async function PlantPage({ params }: PageProps<"/plants/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const owned = await getOwnedPlant(await requireUserId(), id);
  if (!owned) notFound();

  const { plant, species, home } = owned;
  const logs = await listWateringLogs(plant.id);
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("fr-FR", { timeZone: home.timezone, dateStyle: "medium", timeStyle: "short" });
  const fmtDay = new Intl.DateTimeFormat("fr-FR", { timeZone: home.timezone, dateStyle: "long" });
  const Location = plant.location === "outdoor" ? Trees : House;
  const { alerts, tips } = adviceForPlant(plant, species, home, now);
  const SOURCE_LABEL = { catalog: "Fiche du catalogue Plant Care", perenual: "Nom issu de Perenual", manual: "Profil personnalisé" } as const;

  return (
    <>
      <div className="flex items-start gap-4">
      <PlantArt art={artFor(species)} label={`Illustration : ${species.commonName}`} className="size-24 sm:size-32" />
      <div className="min-w-0 space-y-2">
        <h1 className="text-2xl font-semibold">{plant.nickname}</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Location aria-hidden className="size-4" />
          {plant.location === "outdoor" ? "Extérieur" : "Intérieur"} · {species.commonName}
          {species.scientificName && <em>({species.scientificName})</em>}
        </p>
        <PlantStatus
          status={wateringStatus(plant.nextWateringAt ?? now, now, home.timezone)}
          nextAt={plant.nextWateringAt}
          timeZone={home.timezone}
          now={now}
        />
        {plant.nextWateringAt && (
          <p className="text-sm">
            Prochain arrosage : <time className="font-semibold">{fmtDay.format(plant.nextWateringAt)}</time>
            {plant.nextWateringReason && <span className="text-muted-foreground"> · {plant.nextWateringReason}</span>}
          </p>
        )}
      </div>
      </div>

      {plant.archivedAt && (
        <p className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm">
          <Archive aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          Plante archivée : elle ne reçoit plus de rappels. Restaure-la depuis les réglages ci-dessous.
        </p>
      )}
      {!plant.archivedAt && alerts.map((a) => (
        <p key={a} role="alert" className="flex gap-2 rounded-lg border border-destructive/40 bg-card p-3 text-sm">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" /> {a}
        </p>
      ))}
      {tips.length > 0 && (
        <section className="space-y-2 rounded-lg bg-muted p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Lightbulb aria-hidden className="size-5 text-primary" /> Conseils
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>
      )}

      {!plant.archivedAt && <WateringForm plantId={plant.id} />}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Historique</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun arrosage noté pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y rounded-lg border bg-card">
            {logs.map((log) => {
              const label = fmt.format(log.wateredAt);
              const Icon = log.source === "rain" ? CloudRain : Droplets;
              return (
                <li key={log.id} className="flex items-center gap-3 px-3 py-1.5">
                  <Icon aria-hidden className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1 text-sm">
                    <time className="tabular">{label}</time>
                    {log.source === "rain" && <span className="text-muted-foreground"> · pluie</span>}
                    {log.note && <p className="truncate text-muted-foreground">{log.note}</p>}
                  </div>
                  <DeleteLogButton logId={log.id} label={label} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-xs text-muted-foreground">{SOURCE_LABEL[species.source]}</p>

      <PlantSettingsForm
        plantId={plant.id}
        nickname={plant.nickname}
        archived={Boolean(plant.archivedAt)}
        intervalOverrideDays={plant.intervalOverrideDays}
        speciesIntervalDays={species.baseIntervalDays}
      />
    </>
  );
}
