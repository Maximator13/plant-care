import { describe, expect, it } from "vitest";
import { duePayload, pushSubscriptionSchema } from "./push";

describe("duePayload", () => {
  it("lists the plants and flags the overdue ones", () => {
    expect(
      duePayload([
        { nickname: "Lavande", status: "overdue" },
        { nickname: "Ficus", status: "today" },
      ]),
    ).toEqual({ title: "2 plantes à arroser", body: "Lavande (en retard), Ficus", url: "/" });
  });

  it("uses the singular for one plant", () => {
    expect(duePayload([{ nickname: "Ficus", status: "today" }]).title).toBe("1 plante à arroser");
  });
});

describe("pushSubscriptionSchema", () => {
  const keys = { p256dh: "BNc", auth: "tBH" };
  it("accepts a browser subscription", () => {
    expect(pushSubscriptionSchema.safeParse({ endpoint: "https://web.push.apple.com/abc", keys }).success).toBe(true);
  });
  it("rejects non-https endpoints (no SSRF towards internal http services)", () => {
    expect(pushSubscriptionSchema.safeParse({ endpoint: "http://169.254.169.254/latest", keys }).success).toBe(false);
  });
  it("rejects https hosts that are not browser push services", () => {
    expect(pushSubscriptionSchema.safeParse({ endpoint: "https://evil.example/fcm.googleapis.com", keys }).success).toBe(false);
    expect(pushSubscriptionSchema.safeParse({ endpoint: "https://googleapis.com.evil.example/x", keys }).success).toBe(false);
  });
  it("rejects missing keys", () => {
    expect(pushSubscriptionSchema.safeParse({ endpoint: "https://fcm.googleapis.com/x", keys: { p256dh: "" } }).success).toBe(false);
  });
});
