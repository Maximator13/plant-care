import { timingSafeEqual } from "node:crypto";
import { start } from "workflow/api";
import { dailyCheck } from "@/workflows/daily-check";

// Constant-time comparison so the secret cannot be guessed from response timings.
function authorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Vercel Cron sends "Authorization: Bearer $CRON_SECRET" when CRON_SECRET is set.
export async function GET(request: Request) {
  if (!authorized(request.headers.get("authorization"))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const run = await start(dailyCheck);
  return Response.json({ runId: run.runId });
}
