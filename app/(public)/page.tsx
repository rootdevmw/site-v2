import Link from "next/link";

import { HeroCarousel } from "@/components/public/HeroCarousel";
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
      <section className="relative min-h-[640px] overflow-hidden bg-[#1a0a02]">
        {/* Background carousel */}
        <HeroCarousel />

        {/* Overlay — slightly denser to keep text legible over brighter images */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a02]/75 via-[#2b1405]/55 to-[#3d1a07]/35" />

        {/* Decorative cross */}
        <div className="absolute right-0 top-0 h-[500px] w-[500px] opacity-[0.06]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative mx-auto grid min-h-[640px] max-w-screen-2xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          {/* LEFT — TEXT */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-8 bg-[#e8c49a]" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8c49a]">
                Welcoming you home
              </p>
            </div>

            <h1 className="font-serif text-5xl font-semibold leading-[1.12] text-white sm:text-6xl lg:text-7xl">
              Growing together
              <br />
              <span className="text-[#e8c49a]">in Christ.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#fde5c0]">
              Join us for worship, teaching, fellowship, and practical ministry
              shaped by the hope of the gospel.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/live"
                className="rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#2b1405] shadow-lg transition hover:bg-[#faebd7] hover:shadow-xl active:scale-[0.98]"
              >
                Watch live →
              </Link>
              <Link
                href="/about"
                className="rounded-lg border border-white/30 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/10"
              >
                Our story →
              </Link>
            </div>
          </div>

          {/* RIGHT — VISUAL CARD (fills space) */}
          <div className="relative hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-md shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#e8c49a]">
                Join us Sundays
              </p>
              <p className="mt-2 font-serif text-xl text-white">
                Worship & Fellowship
              </p>

              <div className="mt-4 space-y-3 text-sm text-[#fde5c0]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#e8c49a]" />
                  7:00 AM Service
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#e8c49a]" />
                  9:30 AM Service
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 text-sm leading-6 text-[#fde5c0]">
                We are grateful that you're here. More than anything, it is our
                prayer that this website leads you closer to God — so that you
                too may experience the blessing of being part of the Body of
                Christ. The Church is more than bricks and mortar; it is a
                living, breathing body made up of people. Together, we are the
                hands and feet of our Lord and Savior, Jesus Christ. Welcome,
                and we hope to see you soon!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ────────────────────────────────────────────── */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
                This week
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-[#4a2008] sm:text-3xl">
                Upcoming gatherings
              </h2>
            </div>
            <Link
              href="/events"
              className="hidden shrink-0 text-sm font-semibold text-[#4a2008] underline underline-offset-4 hover:text-[#c2620a] sm:block"
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
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8c49a] bg-white transition-all duration-200 hover:border-[#7c3d0f]/20 hover:shadow-lg"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 inline-flex flex-col items-center self-start rounded-xl border border-[#f0dfc0] bg-[#fdf6ee] px-3 py-2 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#c2620a]">
                        {formatMonth(event.startTime)}
                      </span>
                      <span className="font-serif text-2xl font-bold leading-none text-[#4a2008]">
                        {formatDay(event.startTime)}
                      </span>
                      {formatDayOfWeek(event.startTime) && (
                        <span className="text-[9px] font-medium text-[#8c6d3f]">
                          {formatDayOfWeek(event.startTime)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif flex-1 text-lg font-semibold leading-snug text-[#4a2008] group-hover:text-[#7c3d0f]">
                      {event.title}
                    </h3>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-[#6b4c2a]">
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-[#c2620a]"
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
                      <div className="flex items-center gap-2 text-sm text-[#6b4c2a]">
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-[#c2620a]"
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

                    <div className="mt-4 flex items-center gap-1 border-t border-[#faebd7] pt-4 text-xs font-semibold text-[#c2620a]">
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
            className="mt-6 flex items-center justify-center text-sm font-semibold text-[#4a2008] underline underline-offset-4 sm:hidden"
          >
            View all events →
          </Link>
        </div>
      </section>

      {/* ── SERMONS ───────────────────────────────────────────── */}
      <section className="bg-[#2b1405] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c49a]">
                Teaching
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-white sm:text-3xl">
                Latest messages
              </h2>
            </div>
            <Link
              href="/sermons"
              className="hidden shrink-0 text-sm font-semibold text-[#e8c49a] underline underline-offset-4 hover:text-white sm:block"
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
                  <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#e8c49a]">
                    {item.type?.name || "Message"}
                  </span>
                  <h3 className="font-serif mt-4 flex-1 text-lg font-semibold leading-snug text-white group-hover:text-[#fde5c0]">
                    {item.title}
                  </h3>
                  <div className="mt-5 flex items-center gap-1 border-t border-white/10 pt-4 text-xs font-semibold text-[#e8c49a]">
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
      <section className="bg-[#fdf6ee] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
                Serve
              </p>
              <h2 className="font-serif mt-2 text-2xl font-semibold text-[#4a2008] sm:text-3xl">
                Find your place
              </h2>
              <p className="mt-2 max-w-md text-sm text-[#6b4c2a]">
                Every gift matters. Explore the teams serving our church and
                community.
              </p>
            </div>
            <Link
              href="/ministries"
              className="mt-3 inline-flex items-center gap-2 self-start rounded-lg bg-[#c2620a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7c3d0f] lg:self-auto"
            >
              All ministries →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ministries.map((ministry) => (
              <Link
                key={ministry.id}
                href={`/ministries/${ministry.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8c49a] bg-white transition hover:border-[#7c3d0f]/20 hover:shadow-md"
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#faebd7] text-[#4a2008]">
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
                  <h3 className="font-serif font-semibold text-[#4a2008] group-hover:text-[#7c3d0f]">
                    {ministry.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#6b4c2a]">
                    {ministry.description || "Serving together with purpose."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#e8c49a] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
              New here?
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#4a2008]">
              You're welcome just as you are — no expectations, just a warm
              welcome.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-[#c2620a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7c3d0f]"
            >
              Plan a visit
            </Link>
            <Link
              href="/about"
              className="rounded-lg border border-[#e8c49a] bg-white px-5 py-2.5 text-sm font-semibold text-[#4a2008] transition hover:border-[#7c3d0f]/30 hover:shadow-sm"
            >
              Learn about us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
