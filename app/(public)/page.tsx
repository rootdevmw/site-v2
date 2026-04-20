import Link from "next/link";

import { PublicEmptyState } from "@/components/public/PublicEmptyState";
import { getPublishedContent } from "@/lib/public-api/content";
import { getPublicEvents } from "@/lib/public-api/events";
import { getPublicMinistries } from "@/lib/public-api/ministries";
import { getLiveStream } from "@/lib/public-api/streams";

function formatDay(value?: string | null) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric" });
}

function formatMonth(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, { month: "short" });
}

function formatDayOfWeek(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { weekday: "short" });
}

function formatTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PublicHomePage() {
  const today = new Date().toISOString();
  const [contentRes, eventsRes, ministriesRes, liveRes] = await Promise.all([
    getPublishedContent({ page: 1, limit: 3 }),
    getPublicEvents({ page: 1, limit: 3, startDate: today }),
    getPublicMinistries({ page: 1, limit: 6 }),
    getLiveStream(),
  ]);

  const sermons = contentRes.data;
  const events = eventsRes.data;
  const ministries = ministriesRes.data;
  const liveStream = liveRes.data;

  return (
    <div className="font-sans">
      {/* ── LIVE BANNER ───────────────────────────────────────── */}
      {liveStream && (
        <div className="relative z-50 bg-[#a04747] px-4 py-3 text-white">
          <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
              </span>
              <p className="text-sm font-semibold tracking-wide">
                Live now —{" "}
                <span className="font-normal opacity-90">
                  {liveStream.title}
                </span>
              </p>
            </div>
            <Link
              href="/live"
              className="shrink-0 rounded-md border border-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest transition hover:bg-white/10"
            >
              Join stream →
            </Link>
          </div>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[640px] overflow-hidden bg-[#0f2420]">
        <img
          src="/IMGL8976.jpg"
          alt="Church gathering"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2420]/80 via-[#18342f]/60 to-[#1a4a3d]/40" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] opacity-5">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>

        <div className="relative mx-auto flex min-h-[640px] max-w-screen-2xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-8 bg-[#a8c5bb]" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a8c5bb]">
                Church of Christ · Red Cross
              </p>
            </div>
            <h1 className="font-serif text-5xl font-semibold leading-[1.12] text-white sm:text-6xl lg:text-7xl">
              Growing together
              <br />
              <span className="text-[#9ecfbf]">in Christ.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#c5dcd5]">
              Join us for worship, teaching, fellowship, and practical ministry
              shaped by the hope of the gospel.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#18342f] shadow-lg transition hover:bg-[#edf4ef] hover:shadow-xl active:scale-[0.98]"
              >
                Plan a visit
              </Link>
              <Link
                href="/about"
                className="rounded-lg border border-white/30 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
              >
                Our story →
              </Link>
            </div>
          </div>

          <div className="mt-14 inline-flex max-w-sm items-center gap-4 rounded-xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#a8c5bb]/30">
              <svg
                className="h-5 w-5 text-[#a8c5bb]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9ecfbf]">
                Join us Sundays
              </p>
              <p className="mt-0.5 text-sm text-white/80">
                Services at 9:00 AM & 11:00 AM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
                This week
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-[#18342f] sm:text-3xl">
                Upcoming gatherings
              </h2>
            </div>
            <Link
              href="/events"
              className="hidden shrink-0 text-sm font-semibold text-[#18342f] underline underline-offset-4 hover:text-[#4a7c6f] sm:block"
            >
              All events →
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {events.length > 0 ? (
              events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#d8e2dc] bg-white transition-all duration-200 hover:border-[#18342f]/20 hover:shadow-lg"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-[#18342f] to-[#4a7c6f]" />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 inline-flex flex-col items-center self-start rounded-xl border border-[#e2ece6] bg-[#f4f8f5] px-3 py-2 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#4a7c6f]">
                        {formatMonth(event.startTime)}
                      </span>
                      <span className="font-serif text-2xl font-bold leading-none text-[#18342f]">
                        {formatDay(event.startTime)}
                      </span>
                      {formatDayOfWeek(event.startTime) && (
                        <span className="text-[9px] font-medium text-[#6b8c80]">
                          {formatDayOfWeek(event.startTime)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif flex-1 text-lg font-semibold leading-snug text-[#18342f] group-hover:text-[#285047]">
                      {event.title}
                    </h3>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-[#52645d]">
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-[#4a7c6f]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatTime(event.startTime)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#52645d]">
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-[#4a7c6f]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {event.location || "Location to be announced"}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 border-t border-[#eef5f1] pt-4 text-xs font-semibold text-[#4a7c6f]">
                      View details
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3">
                <PublicEmptyState message="No upcoming events have been posted yet." />
              </div>
            )}
          </div>

          <Link
            href="/events"
            className="mt-6 flex items-center justify-center text-sm font-semibold text-[#18342f] underline underline-offset-4 sm:hidden"
          >
            View all events →
          </Link>
        </div>
      </section>

      {/* ── SERMONS ───────────────────────────────────────────── */}
      <section className="bg-[#18342f] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9ecfbf]">
                Teaching
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-white sm:text-3xl">
                Latest messages
              </h2>
            </div>
            <Link
              href="/sermons"
              className="hidden shrink-0 text-sm font-semibold text-[#9ecfbf] underline underline-offset-4 hover:text-white sm:block"
            >
              All sermons →
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {sermons.length > 0 ? (
              sermons.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/sermons/${item.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
                >
                  <span className="font-serif pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold text-white/[0.04]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#9ecfbf]">
                    {item.type?.name || "Message"}
                  </span>
                  <h3 className="font-serif mt-4 flex-1 text-lg font-semibold leading-snug text-white group-hover:text-[#c5dcd5]">
                    {item.title}
                  </h3>
                  <div className="mt-5 flex items-center gap-1 border-t border-white/10 pt-4 text-xs font-semibold text-[#9ecfbf]">
                    Read
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3">
                <PublicEmptyState message="No published messages are available yet." />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MINISTRIES ────────────────────────────────────────── */}
      <section className="bg-[#f4f8f5] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
                Serve
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-[#18342f] sm:text-3xl">
                Find your place
              </h2>
              <p className="mt-2 max-w-md text-sm text-[#52645d]">
                Every gift matters. Explore the teams serving our church and
                community.
              </p>
            </div>
            <Link
              href="/ministries"
              className="mt-3 inline-flex items-center gap-2 self-start rounded-lg bg-[#18342f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#285047] lg:self-auto"
            >
              All ministries →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ministries.map((ministry) => (
              <Link
                key={ministry.id}
                href={`/ministries/${ministry.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#d8e2dc] bg-white transition hover:border-[#18342f]/20 hover:shadow-md"
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#18342f] to-[#4a7c6f]" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#eef5f1] text-[#18342f]">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-serif font-semibold text-[#18342f] group-hover:text-[#285047]">
                    {ministry.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#52645d]">
                    {ministry.description || "Serving together with purpose."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#d8e2dc] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
              New here?
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#18342f]">
              You're welcome just as you are — no expectations, just a warm welcome.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-[#18342f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#285047]"
            >
              Plan a visit
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-[#c5d8d0] bg-white px-5 py-2.5 text-sm font-semibold text-[#18342f] transition hover:border-[#18342f]/30 hover:shadow-sm"
            >
              Learn about us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
