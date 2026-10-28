import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { LegalFooter } from "@/components/legal-footer";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Crée ton compte Plant Care gratuitement.",
};

export default function Page() {
  return (
    <>
      <main className="flex flex-1 items-center justify-center p-4">
        <SignUp />
      </main>
      <LegalFooter />
    </>
  );
}
