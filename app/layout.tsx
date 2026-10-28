import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import type { Metadata, Viewport } from "next";
import { Lora, Raleway } from "next/font/google";
import { Consent } from "@/components/consent";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · Arrosage intelligent`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  openGraph: { type: "website", locale: "fr_FR", siteName: SITE_NAME, url: "/" },
  twitter: { card: "summary_large_image" },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  viewportFit: "cover", // full screen on iPhone; safe areas handled with env(safe-area-inset-*)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6efe2" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1823" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${lora.variable} ${raleway.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          localization={frFR}
          appearance={{ variables: { colorPrimary: "#6a4c93", fontFamily: "var(--font-raleway)" } }}
        >
          {children}
          <Consent />
        </ClerkProvider>
      </body>
    </html>
  );
}
