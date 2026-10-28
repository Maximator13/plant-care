import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { LegalFooter } from "@/components/legal-footer";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connecte-toi à Plant Care pour suivre l'arrosage de tes plantes selon la météo locale.",
};

export default function Page() {
  return (
    <>
      <main className="flex flex-1 items-center justify-center p-4">
        <SignIn />
      </main>
      <LegalFooter />
    </>
  );
}
