"use client";

import { Check, Droplets, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { logWatering, type ActionState } from "@/app/actions";
import { Honeypot } from "@/components/honeypot";
import { Button } from "@/components/ui/button";

export function WaterButton({ plantId, nickname }: { plantId: string; nickname: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(logWatering, undefined);
  const done = state !== undefined && !state.error;
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <Honeypot />
      <input type="hidden" name="plantId" value={plantId} />
      <Button type="submit" disabled={pending} aria-label={`Marquer ${nickname} comme arrosée`}>
        {pending ? (
          <Loader2 aria-hidden className="animate-spin" />
        ) : done ? (
          <Check aria-hidden className="animate-in zoom-in spin-in-45 duration-300" />
        ) : (
          <Droplets aria-hidden />
        )}
        {done && !pending ? "Arrosée !" : "Arrosé"}
      </Button>
      {state?.error && (
        <p role="alert" className="text-xs text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
