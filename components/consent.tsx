"use client";

import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

// Consent for audience measurement (Vercel Web Analytics). Clerk's session cookies are strictly
// necessary and need no consent. The choice lives in localStorage; "consent-change" notifies the page.
const KEY = "plant-care-consent";
type Consent = "granted" | "denied" | null;

const read = (): Consent => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};
const write = (v: Consent) => {
  try {
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event("consent-change"));
};
const subscribe = (cb: () => void) => {
  window.addEventListener("consent-change", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("consent-change", cb);
    window.removeEventListener("storage", cb);
  };
};

export function Consent() {
  // "unknown" on the server so the banner never flashes for people who already chose.
  const consent = useSyncExternalStore<Consent | "unknown">(subscribe, read, () => "unknown");
  if (consent === "granted") return <Analytics />;
  if (consent !== null) return null;
  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-30 mx-auto max-w-xl space-y-3 rounded-lg border bg-card p-4 shadow-lg"
    >
      <p id="consent-title" className="font-serif font-semibold">
        Mesure d&apos;audience
      </p>
      <p className="text-sm">
        Nous aimerions mesurer la fréquentation de façon anonyme pour améliorer l&apos;app. Rien n&apos;est chargé sans
        ton accord. Les cookies de connexion, indispensables, sont toujours actifs.{" "}
        <Link href="/confidentialite" className="underline underline-offset-4">
          En savoir plus
        </Link>
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => write("granted")}>Accepter</Button>
        <Button variant="outline" onClick={() => write("denied")}>
          Refuser
        </Button>
      </div>
    </div>
  );
}

export function ManageConsentButton() {
  return (
    <button type="button" onClick={() => write(null)} className="underline-offset-4 hover:underline">
      Gérer les cookies
    </button>
  );
}
