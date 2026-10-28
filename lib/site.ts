// Production URL on Vercel (system env), localhost otherwise.
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const SITE_NAME = "Plant Care";
export const SITE_DESCRIPTION =
  "Suivi d'arrosage intelligent de vos plantes d'intérieur et d'extérieur, adapté à la météo locale et aux saisons.";

export const PUBLIC_PATHS = ["/sign-in", "/mentions-legales", "/confidentialite", "/cgu"] as const;
