import { Sprout } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <Sprout aria-hidden className="size-12 text-primary" />
      <h1 className="text-2xl font-semibold">Cette page n&apos;a pas encore germé</h1>
      <p className="text-muted-foreground">Le lien est peut-être cassé, ou la plante a été archivée.</p>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </main>
  );
}
