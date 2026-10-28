"use client";

import { Archive, ArchiveRestore, Loader2, Trash2 } from "lucide-react";
import { useActionState, useTransition } from "react";
import { deletePlant, updatePlant, type ActionState } from "@/app/actions";
import { Honeypot } from "@/components/honeypot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlantSettingsForm({
  plantId,
  nickname,
  archived,
  intervalOverrideDays,
  speciesIntervalDays,
}: {
  plantId: string;
  nickname: string;
  archived: boolean;
  intervalOverrideDays: number | null;
  speciesIntervalDays: number;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updatePlant, undefined);
  const [deleting, startDelete] = useTransition();
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <h2 className="text-lg font-semibold">Réglages de la plante</h2>
      <form action={action} className="space-y-3">
        <Honeypot />
        <input type="hidden" name="plantId" value={plantId} />
        <div className="space-y-1.5">
          <Label htmlFor="override">Intervalle personnalisé (jours)</Label>
          <Input
            id="override"
            name="intervalOverrideDays"
            type="number"
            min={0.5}
            max={365}
            step={0.5}
            inputMode="decimal"
            defaultValue={intervalOverrideDays ?? ""}
            placeholder={`Par défaut : ${Number(speciesIntervalDays.toFixed(1))} j`}
            className="tabular h-11 max-w-48"
            aria-describedby="override-help"
          />
          <p id="override-help" className="text-xs text-muted-foreground">
            Laisse vide pour utiliser l&apos;intervalle de l&apos;espèce. La saison et la météo l&apos;ajustent ensuite.
          </p>
        </div>
        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" disabled={pending}>
            {pending && <Loader2 aria-hidden className="animate-spin" />}
            Enregistrer
          </Button>
          {archived ? (
            <Button type="submit" name="archive" value="restore" variant="outline" disabled={pending}>
              <ArchiveRestore aria-hidden /> Restaurer
            </Button>
          ) : (
            <Button
              type="submit"
              name="archive"
              value="archive"
              variant="outline"
              disabled={pending}
              onClick={(e) => {
                if (!confirm(`Archiver ${nickname} ? Elle sortira des rappels mais restera dans les archives.`)) e.preventDefault();
              }}
            >
              <Archive aria-hidden /> Archiver
            </Button>
          )}
        </div>
      </form>

      <div className="border-t pt-3">
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          disabled={deleting}
          onClick={() => {
            if (confirm(`Supprimer définitivement ${nickname} et tout son historique d'arrosage ? Cette action est irréversible.`)) {
              startDelete(() => deletePlant(plantId));
            }
          }}
        >
          {deleting ? <Loader2 aria-hidden className="animate-spin" /> : <Trash2 aria-hidden />}
          Supprimer définitivement
        </Button>
      </div>
    </div>
  );
}
