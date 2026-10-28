"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteWateringLog } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function DeleteLogButton({ logId, label }: { logId: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={pending}
      aria-label={`Supprimer l'arrosage du ${label}`}
      onClick={() => {
        if (confirm(`Supprimer l'arrosage du ${label} ?`)) start(() => deleteWateringLog(logId));
      }}
    >
      {pending ? <Loader2 aria-hidden className="animate-spin" /> : <Trash2 aria-hidden />}
    </Button>
  );
}
