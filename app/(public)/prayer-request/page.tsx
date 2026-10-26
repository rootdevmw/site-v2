import type { Metadata } from "next";
import Link from "next/link";
import { PrayerForm } from "@/components/public/PrayerForm";
import { church } from "@/config/church";
export const metadata: Metadata = {
  alternates: { canonical: "/prayer-request" },
  title: "Request prayer",
  description:
    "Share a prayer request with Church of Christ at Red Cross, or take a moment for personal prayer.",
};
export default function PrayerRequestPage() {
  return (
    <>
      <header className="public-container public-section-tight">
        <p className="public-eyebrow">Prayer and care</p>
        <h1 className="public-display mt-5 max-w-4xl text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
          You do not have to
          <br />
          carry it alone.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--public-muted)] sm:text-lg">
          Whatever this season holds, we would be glad to join you in prayer.
          Share a request with the church or take a quiet moment for personal
          prayer.
        </p>
      </header>
      <section className="public-container grid items-start gap-8 public-section-end lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.45fr)] lg:gap-10">
        <div className="min-w-0">
          <PrayerForm />
        </div>
        <aside className="min-w-0 space-y-7">
          <div className="rounded-2xl bg-[var(--brand-soft)] p-6">
            <h2 className="public-display text-2xl">Handled with care.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              Shared requests are available to authorised church staff and the
              prayer team. Please avoid including another person&apos;s private
              details without their permission.
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              Choosing personal prayer keeps your words on this page without
              sending them to the church.
            </p>
          </div>
          <div>
            <h2 className="public-display text-2xl">Prefer a conversation?</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              You are welcome to contact the church team directly.
            </p>
            <a href={church.phoneUrl} className="public-text-link mt-3">
              Call {church.phone}
            </a>
            <div>
              <Link href="/contact" className="public-text-link mt-2">
                Other ways to reach us
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
