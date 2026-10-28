import type { Metadata } from "next";
import { HomeForm } from "@/components/home-form";
import { PushToggle } from "@/components/push-toggle";
import { getHomeForUser, requireUserId } from "@/lib/plants";

export const metadata: Metadata = {
  title: "Réglages",
  description: "Localisation de la maison et notifications d'arrosage.",
};

export default async function SettingsPage() {
  const home = await getHomeForUser(await requireUserId());
  return (
    <>
      <h1 className="text-2xl font-semibold">Réglages</h1>
      {!home && <p>Bienvenue ! Indique d&apos;abord où se trouve ta maison pour adapter l&apos;arrosage à ta météo.</p>}
      {home && process.env.VAPID_PUBLIC_KEY && (
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-semibold">Notifications</h2>
          <PushToggle vapidPublicKey={process.env.VAPID_PUBLIC_KEY} />
        </section>
      )}
      <HomeForm home={home} />
    </>
  );
}
