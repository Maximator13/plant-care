import { House, Trees } from "lucide-react";
import Link from "next/link";
import { artFor, PlantArt } from "@/components/plant-art";
import { PlantStatus } from "@/components/plant-status";
import { Card, CardContent } from "@/components/ui/card";
import { WaterButton } from "@/components/water-button";
import type { PlantWithStatus } from "@/lib/plants";

export function PlantCard({
  plant,
  timeZone,
  showWater = true,
}: {
  plant: PlantWithStatus;
  timeZone: string;
  showWater?: boolean;
}) {
  const Location = plant.location === "outdoor" ? Trees : House;
  return (
    <Card className="transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-3">
        <PlantArt art={artFor(plant.species)} label={`Illustration : ${plant.species.commonName}`} className="size-16" />
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            href={`/plants/${plant.id}`}
            className="block truncate font-serif text-base font-semibold underline-offset-4 outline-none hover:underline focus-visible:underline"
          >
            {plant.nickname}
          </Link>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Location aria-hidden className="size-3.5 shrink-0" />
            <span className="sr-only">{plant.location === "outdoor" ? "Extérieur" : "Intérieur"} · </span>
            {plant.species.commonName}
          </p>
          <PlantStatus status={plant.status} nextAt={plant.nextWateringAt} timeZone={timeZone} />
        </div>
        {showWater && <WaterButton plantId={plant.id} nickname={plant.nickname} />}
      </CardContent>
    </Card>
  );
}
