import Link from "next/link";
import { getPublicEvents } from "@/lib/public-api/events";
import { Pagination } from "@/components/public/Pagination";

const PAGE_SIZE = 6;

function formatDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric" });
}

function formatMonth(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short" });
}

function formatYear(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric" });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDayOfWeek(value: string) {
  return new Date(value).toLocaleDateString(undefined, { weekday: "long" });
}

export default async function PublicEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const res = await getPublicEvents({
    page,
    limit: PAGE_SIZE,
    startDate: new Date().toISOString(),
  });

  const events = res.data;
  const total = res.meta?.total ?? 0;
  const totalPages = res.meta?.totalPages ?? Math.ceil(total / PAGE_SIZE);

  return (
    <div className="font-sans">
      {/* ── PAGE HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-screen-2xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <div className="h-px w-6 bg-[#e8c49a]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8c49a]">
                  Events
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                Upcoming gatherings
              </h1>
              <p className="mt-1.5 text-sm text-[#e6c79c]">
                Services, fellowships, classes and outreach — there's always a
                place for you.
              </p>
            </div>
            {total > 0 && (
              <p className="mt-3 text-xs font-medium text-[#c2a23a] sm:mt-0">
                {total} upcoming event{total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── EVENTS GRID ───────────────────────────────────────── */}
      <section className="bg-[#fdf6ee] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          {events.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {events.map((event, i) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8c49a] bg-white transition-all duration-200 hover:border-[#7c3d0f]/20 hover:shadow-lg"
                  >
                    {/* Coloured top strip keyed to position */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />

                    <div className="flex flex-1 flex-col p-6">
                      {/* Date badge */}
                      <div className="mb-4 inline-flex flex-col items-center self-start rounded-xl border border-[#f0dfc0] bg-[#fdf6ee] px-3 py-2 text-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#c2620a]">
                          {formatMonth(event.startTime)}
                        </span>
                        <span className="font-serif text-2xl font-bold leading-none text-[#4a2008]">
                          {formatDay(event.startTime)}
                        </span>
                        <span className="text-[9px] font-medium text-[#8c6d3f]">
                          {formatYear(event.startTime)}
                        </span>
                      </div>

                      <h2 className="font-serif flex-1 text-lg font-semibold leading-snug text-[#4a2008] group-hover:text-[#7c3d0f]">
                        {event.title}
                      </h2>

                      <div className="mt-4 space-y-1.5">
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
                          {formatDayOfWeek(event.startTime)},{" "}
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

                      <div className="mt-5 flex items-center justify-end gap-1 border-t border-[#faebd7] pt-4 text-xs font-semibold text-[#c2620a]">
                        View details
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                basePath="/events"
              />
            </>
          ) : (
            <div className="rounded-2xl border border-[#e8c49a] bg-white px-8 py-20 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#faebd7] text-[#c2620a]">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="font-serif text-xl font-semibold text-[#4a2008]">
                No upcoming events
              </p>
              <p className="mt-2 text-sm text-[#6b4c2a]">
                Check back soon — new gatherings are added regularly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── RECURRING SERVICES ────────────────────────────────── */}
      <section className="bg-[#2b1405] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c49a]">
              Every week
            </p>
            <h2 className="font-serif mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Regular gatherings
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                day: "Sunday",
                time: "9:00 AM",
                title: "Morning Worship",
                detail:
                  "Our main gathering — teaching, singing, and communion.",
              },
              {
                day: "Sunday",
                time: "11:00 AM",
                title: "Second Service",
                detail: "A second opportunity to worship together as a family.",
              },
              {
                day: "Wednesday",
                time: "6:30 PM",
                title: "Bible Study",
                detail: "Mid-week study and prayer for deeper discipleship.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e8c49a]">
                    {item.day}
                  </span>
                  <span className="h-3 w-px bg-white/20" />
                  <span className="text-[10px] font-medium text-[#e6c79c]">
                    {item.time}
                  </span>
                </div>
                <h3 className="font-serif text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-[#e6c79c]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#e8c49a] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
              First time?
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#4a2008]">
              We'd love to see you — no expectations, just a warm welcome.
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
              href="/live"
              className="rounded-lg border border-[#e8c49a] bg-white px-5 py-2.5 text-sm font-semibold text-[#4a2008] transition hover:border-[#7c3d0f]/30 hover:shadow-sm"
            >
              Watch online
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
