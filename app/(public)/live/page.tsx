import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CurrentBroadcast } from "@/components/public/OnlineLibrary";
import { ServiceTimes } from "@/components/public/ServiceTimes";
import { libraryHref, readLibraryFilters } from "@/lib/utils/public-library";
import type { GroupSearchParams } from "@/lib/utils/public-groups";
export const metadata: Metadata = {
  alternates: { canonical: "/live" },
  title: "Watch online",
  description:
    "Join the current live broadcast from Church of Christ at Red Cross, Blantyre.",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<GroupSearchParams>;
}) {
  const params = await searchParams;
  if (["page", "q", "period"].some((key) => params[key] !== undefined))
    redirect(libraryHref("/broadcasts", readLibraryFilters(params)));
  return (
    <>
      <header className="public-container public-section-tight grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
        <div className="min-w-0">
          <p className="public-eyebrow">Online worship · Live broadcast</p>
          <h1 className="public-display mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
            Worship with us,
            <br />
            wherever you are.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
            Join us here when we are broadcasting. Earlier recordings and
            upcoming services are in the broadcast library.
          </p>
        </div>
        <aside className="min-w-0 rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-6">
          <h2 className="public-display mb-5 text-2xl">Join us in person.</h2>
          <ServiceTimes />
          <Link href="/plan-visit" className="public-text-link mt-4">
            Plan your first visit
          </Link>
        </aside>
      </header>
      <section
        className="public-container public-section-end"
        aria-label="Current broadcast"
      >
        <Suspense
          fallback={
            <p role="status" className="text-stone-500">
              Checking the live broadcast…
            </p>
          }
        >
          <CurrentBroadcast />
        </Suspense>
      </section>
    </>
  );
}
