import Link from "next/link";
import { ManageConsentButton } from "@/components/consent";
import { cn } from "@/lib/utils";

export function LegalFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("mx-auto w-full max-w-2xl px-4 py-6 text-xs text-muted-foreground", className)}>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        <li>
          <Link href="/mentions-legales" className="underline-offset-4 hover:underline">
            Mentions légales
          </Link>
        </li>
        <li>
          <Link href="/confidentialite" className="underline-offset-4 hover:underline">
            Confidentialité
          </Link>
        </li>
        <li>
          <Link href="/cgu" className="underline-offset-4 hover:underline">
            CGU
          </Link>
        </li>
        <li>
          <ManageConsentButton />
        </li>
      </ul>
      <p className="mt-3">Conçue et développée par Maxime Coquet</p>
    </footer>
  );
}
