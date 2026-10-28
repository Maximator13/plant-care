import { Leaf } from "lucide-react";
import Link from "next/link";
import { LegalFooter } from "@/components/legal-footer";

export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="mx-auto w-full max-w-2xl px-4 pt-4">
        <Link href="/" className="inline-flex items-center gap-2 font-serif text-lg font-semibold text-primary">
          <Leaf aria-hidden className="size-5" /> Plant Care
        </Link>
      </header>
      <main className="legal mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6 text-sm leading-relaxed">{children}</main>
      <LegalFooter />
    </>
  );
}
