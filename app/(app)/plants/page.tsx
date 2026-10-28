import type { Metadata } from "next";
import Link from "next/link";
import { PlantCard } from "@/components/plant-card";
import { Button } from "@/components/ui/button";
import { listPlantsWithStatus, requireHome } from "@/lib/plants";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: undefined, label: "Toutes" },
  { value: "indoor", label: "Intérieur" },
  { value: "outdoor", label: "Extérieur" },
  { value: "archived", label: "Archivées" },
] as const;

export const metadata: Metadata = {
  title: "Mes plantes",
  description: "Toutes tes plantes d'intérieur et d'extérieur avec leur prochain arrosage.",
};

export default async function PlantsPage({ searchParams }: PageProps<"/plants">) {
  const { loc } = await searchParams;
  const home = await requireHome();
  const archived = loc === "archived";
  const all = await listPlantsWithStatus(home, new Date(), archived);
  const plants = loc === "indoor" || loc === "outdoor" ? all.filter((p) => p.location === loc) : all;

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Mes plantes</h1>
        <Button asChild>
          <Link href="/plants/new">Ajouter une plante</Link>
        </Button>
      </div>

      <nav aria-label="Filtrer les plantes" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (loc ?? undefined) === f.value;
          return (
            <Link
              key={f.label}
              href={f.value ? `/plants?loc=${f.value}` : "/plants"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {plants.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          {archived ? "Aucune plante archivée." : "Aucune plante ici."}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {plants.map((p) => (
            <li key={p.id}>
              <PlantCard plant={p} timeZone={home.timezone} showWater={false} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
