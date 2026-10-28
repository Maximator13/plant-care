import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { usageCounters } from "@/db/schema";

// Free API quotas are shared by every user (Pl@ntNet 500/day, Perenual 100/day): global caps sit just under
// them; per-user caps stop one account from exhausting them for everyone.
const LIMITS = {
  photo: { perUser: 50, global: 490 },
  perenual: { perUser: 50, global: 98 },
  pushTest: { perUser: 10, global: 1000 },
} as const;

export type QuotaKind = keyof typeof LIMITS;

/** Counts one use; returns false once the user's or the global daily limit is exceeded. */
export async function consumeQuota(userId: string, kind: QuotaKind): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10); // UTC day
  const bump = (uid: string) =>
    db
      .insert(usageCounters)
      .values({ userId: uid, day, kind, count: 1 })
      .onConflictDoUpdate({
        target: [usageCounters.userId, usageCounters.day, usageCounters.kind],
        set: { count: sql`${usageCounters.count} + 1` },
      })
      .returning({ count: usageCounters.count });
  const [[mine], [all]] = await Promise.all([bump(userId), bump("*")]);
  return mine.count <= LIMITS[kind].perUser && all.count <= LIMITS[kind].global;
}
