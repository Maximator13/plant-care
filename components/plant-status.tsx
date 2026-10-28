import { AlertTriangle, CalendarClock, Droplet } from "lucide-react";
import { daysUntil, type WateringStatus } from "@/lib/watering";
import { cn } from "@/lib/utils";

const STYLE: Record<WateringStatus, string> = {
  overdue: "bg-destructive text-destructive-foreground",
  today: "bg-accent text-accent-foreground",
  upcoming: "bg-muted text-muted-foreground",
};

export function PlantStatus({
  status,
  nextAt,
  timeZone,
  now = new Date(),
}: {
  status: WateringStatus;
  nextAt: Date | null;
  timeZone: string;
  now?: Date;
}) {
  const days = nextAt ? daysUntil(nextAt, now, timeZone) : 0;
  const [Icon, label] =
    status === "overdue"
      ? [AlertTriangle, days === -1 ? "En retard d'1 jour" : `En retard de ${-days} jours`]
      : status === "today"
        ? [Droplet, "À arroser aujourd'hui"]
        : [CalendarClock, days === 1 ? "Demain" : `Dans ${days} jours`];
  return (
    <span className={cn("tabular inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", STYLE[status])}>
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  );
}
