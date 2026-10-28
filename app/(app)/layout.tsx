import { UserButton } from "@clerk/nextjs";
import { Leaf } from "lucide-react";
import type { Metadata } from "next";
import { BottomNav } from "@/components/bottom-nav";
import { LegalFooter } from "@/components/legal-footer";
import { requireUserId } from "@/lib/plants";

// Private, per-user pages: never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireUserId();
  return (
    <>
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-4">
        <span className="inline-flex items-center gap-2 font-serif text-lg font-semibold text-primary">
          <Leaf aria-hidden className="size-5" /> Plant Care
        </span>
        <UserButton />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 pt-4">{children}</main>
      <LegalFooter className="pb-[calc(env(safe-area-inset-bottom)+5rem)]" />
      <BottomNav />
    </>
  );
}
