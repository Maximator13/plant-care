import { Resend } from "resend";
import { SITE_URL } from "./site";

async function send(to: string, subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY missing, email not sent:", subject);
    return;
  }
  const { error } = await new Resend(key).emails.send({
    from: process.env.ALERT_FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject,
    text,
  });
  if (error) console.error("resend", error);
}

export function sendDigest(to: string, plants: { nickname: string; status: "overdue" | "today" }[]): Promise<void> {
  const lines = plants.map((p) => `- ${p.nickname}${p.status === "overdue" ? " (en retard)" : ""}`);
  return send(
    to,
    `Plant Care : ${plants.length} plante${plants.length > 1 ? "s" : ""} à arroser`,
    `Bonjour,\n\nÀ arroser aujourd'hui :\n${lines.join("\n")}\n\nOuvrir l'app : ${SITE_URL}\n`,
  );
}
