import webpush, { WebPushError } from "web-push";
import { z } from "zod";
import { SITE_URL } from "./site";

/**
 * What the browser hands us after `pushManager.subscribe()`. The server later POSTs to `endpoint`, so only the
 * browser vendors' push services are accepted (Chrome/Android, Safari/iOS, Firefox, Edge): no SSRF.
 */
export const pushSubscriptionSchema = z.object({
  endpoint: z
    .url({ protocol: /^https$/, hostname: /(^|\.)(googleapis\.com|push\.apple\.com|push\.services\.mozilla\.com|notify\.windows\.com)$/ })
    .max(1000),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

type Due = { nickname: string; status: "overdue" | "today" };

export function duePayload(due: Due[]) {
  const names = due.map((p) => (p.status === "overdue" ? `${p.nickname} (en retard)` : p.nickname));
  return {
    title: `${due.length} plante${due.length > 1 ? "s" : ""} à arroser`,
    body: names.join(", "),
    url: "/",
  };
}

export type PushPayload = ReturnType<typeof duePayload>;
type Subscription = { endpoint: string; p256dh: string; auth: string };

/** Sends to every device; returns the endpoints the push service says are gone (to delete). */
export async function sendPush(subs: Subscription[], payload: PushPayload): Promise<string[]> {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn("VAPID keys missing, push not sent");
    return [];
  }
  // Push services need an https: contact; localhost is refused, so dev falls back to the public site.
  const subject = SITE_URL.startsWith("https:") ? SITE_URL : "https://plant-care-nine-olive.vercel.app";
  webpush.setVapidDetails(subject, publicKey, privateKey);
  const gone: string[] = [];
  await Promise.all(
    subs.map(async ({ endpoint, p256dh, auth }) => {
      try {
        await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, JSON.stringify(payload), { TTL: 12 * 3600 });
      } catch (error) {
        if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) gone.push(endpoint);
        else console.error("web push failed", error);
      }
    }),
  );
  return gone;
}
