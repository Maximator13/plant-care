"use client";

import { Droplets, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { logWatering, type ActionState } from "@/app/actions";
import { Honeypot } from "@/components/honeypot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// datetime-local has no timezone: the browser converts it to an ISO instant before submitting.
// Empty means "now" (server side), which also avoids an SSR/browser clock mismatch.

export function WateringForm({ plantId }: { plantId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(logWatering, undefined);
  const [local, setLocal] = useState("");
  const iso = local ? new Date(local).toISOString() : "";

  return (
    <form action={action} className="space-y-3 rounded-lg border bg-card p-4">
      <Honeypot />
      <h2 className="text-lg font-semibold">Noter un arrosage</h2>
      <input type="hidden" name="plantId" value={plantId} />
      <input type="hidden" name="wateredAt" value={iso} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="watered-at">Date et heure</Label>
          <Input
            id="watered-at"
            type="datetime-local"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="tabular h-11"
            aria-describedby="watered-at-help"
          />
          <p id="watered-at-help" className="text-xs text-muted-foreground">Laisse vide pour maintenant.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">Note (facultatif)</Label>
          <Input id="note" name="note" maxLength={200} placeholder="Ex. engrais ajouté" className="h-11" />
        </div>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 aria-hidden className="animate-spin" /> : <Droplets aria-hidden />}
        Enregistrer l&apos;arrosage
      </Button>
    </form>
  );
}
