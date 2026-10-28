import type { Metadata } from "next";
import { AlertTriangle, PartyPopper } from "lucide-react";
import Link from "next/link";
import { PlantCard } from "@/components/plant-card";
import { Button } from "@/components/ui/button";
import { WeatherCard } from "@/components/weather-card";
import { listPlantsWithStatus, requireHome, type PlantWithStatus } from "@/lib/plants";
import { adviceForPlant } from "@/lib/plant-advice";
import { getSeason } from "@/lib/season";
import { daysUntil } from "@/lib/watering";

function Section({ title, plants, timeZone }: { title: string; plants: PlantWithStatus[]; timeZone: string }) {
  if (plants.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">
        {title} <span className="tabular text-base font-normal text-muted-foreground">({plants.length})</span>
      </h2>
      <ul className="space-y-3">
        {plants.map((p) => (
          <li key={p.id}>
            <PlantCard plant={p} timeZone={timeZone} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export const metadata: Metadata = {
  title: "Aujourd'hui",
  description: "Les plantes à arroser aujourd'hui, la météo locale et les alertes du botaniste.",
};

export default async function TodayPage() {
  const home = await requireHome();
  const now = new Date();
  const plants = await listPlantsWithStatus(home, now);
  const overdue = plants.filter((p) => p.status === "overdue");
  const today = plants.filter((p) => p.status === "today");
  const soon = plants.filter(
    (p) => p.status === "upcoming" && p.nextWateringAt && daysUntil(p.nextWateringAt, now, home.timezone) <= 7,
  );
  const alerts = plants.flatMap((p) => adviceForPlant(p, p.species, home, now).alerts.map((text) => ({ id: p.id, text })));

  return (
    <>
      <h1 className="text-2xl font-semibold">Aujourd&apos;hui</h1>
      <WeatherCard weather={home.weatherContext} season={getSeason(now, home.latitude)} />

      {alerts.map((a, i) => (
        <p key={`${a.id}-${i}`} role="alert" className="flex gap-2 rounded-lg border border-destructive/40 bg-card p-3 text-sm">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
          <span>{a.text}</span>
        </p>
      ))}

      {plants.length === 0 ? (
        <div className="space-y-3 rounded-lg border border-dashed p-6 text-center">
          <p>Aucune plante pour l&apos;instant.</p>
          <Button asChild>
            <Link href="/plants/new">Ajouter ma première plante</Link>
          </Button>
        </div>
      ) : overdue.length + today.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg bg-card p-4">
          <PartyPopper aria-hidden className="size-5 text-primary" /> Tout est arrosé, rien à faire aujourd&apos;hui.
        </p>
      ) : null}

      <Section title="En retard" plants={overdue} timeZone={home.timezone} />
      <Section title="À arroser aujourd'hui" plants={today} timeZone={home.timezone} />
      <Section title="Prochainement" plants={soon} timeZone={home.timezone} />
    </>
  );
}
