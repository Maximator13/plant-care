import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { homes } from "@/db/schema";

// RGPD: when a Clerk account is deleted, delete its home (cascades to plants and watering logs).
// Signed by Clerk (Svix); secret in CLERK_WEBHOOK_SIGNING_SECRET. Webhooks are per Clerk instance,
// so dev and prod users never purge each other's data.
export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  if (event.type === "user.deleted" && event.data.id) {
    await db.delete(homes).where(eq(homes.userId, event.data.id));
  }
  return new Response("ok");
}
