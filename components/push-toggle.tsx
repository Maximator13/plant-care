"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { subscribePush, testPush, unsubscribePush } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Support = "loading" | "ok" | "unsupported" | "ios-install";

function urlBase64ToUint8Array(base64: string) {
  const raw = atob((base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Per-device switch for the push notifications the site sends every morning. */
export function PushToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [support, setSupport] = useState<Support>("loading");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      // iPhone/iPad only allow web push once the site is added to the home screen.
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setSupport(ios && !matchMedia("(display-mode: standalone)").matches ? "ios-install" : "unsupported");
      return;
    }
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setSubscription(sub);
        setSupport("ok");
      })
      .catch(() => setSupport("unsupported"));
  }, []);

  function toggle(on: boolean) {
    setMessage(null);
    start(async () => {
      try {
        if (on) {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });
          const res = await subscribePush(sub.toJSON());
          if (res?.error) {
            await sub.unsubscribe();
            return setMessage(res.error);
          }
          setSubscription(sub);
        } else if (subscription) {
          await unsubscribePush(subscription.endpoint);
          await subscription.unsubscribe();
          setSubscription(null);
        }
      } catch {
        setMessage(
          Notification.permission === "denied"
            ? "Notifications bloquées : autorise-les pour ce site dans les réglages du navigateur."
            : "Impossible d'activer les notifications sur cet appareil.",
        );
      }
    });
  }

  if (support === "loading") return null;
  if (support === "ios-install")
    return (
      <p className="rounded-md bg-muted p-3 text-sm">
        Sur iPhone, ajoute d&apos;abord Plant Care à l&apos;écran d&apos;accueil (bouton Partager, puis « Sur
        l&apos;écran d&apos;accueil »), ouvre-la depuis l&apos;icône, puis reviens ici pour activer les notifications.
      </p>
    );
  if (support === "unsupported")
    return <p className="rounded-md bg-muted p-3 text-sm">Ce navigateur ne prend pas en charge les notifications.</p>;

  return (
    <div className="space-y-3 rounded-md border bg-card p-3">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="push" className="flex-1 leading-snug">
          Notifications sur cet appareil le matin quand une plante doit être arrosée
        </Label>
        {pending ? (
          <Loader2 aria-label="Patiente" className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <Switch id="push" checked={subscription !== null} onCheckedChange={toggle} />
        )}
      </div>
      {subscription && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => setMessage((await testPush())?.error ?? "Notification de test envoyée."))
          }
        >
          Envoyer une notification de test
        </Button>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
