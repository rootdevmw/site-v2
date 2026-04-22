import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicEvent } from "@/lib/public-api/events";

function formatFull(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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

export default async function PublicEventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getPublicEvent(id);
  const event = res.data;

  if (!event) notFound();

  return (
    <div className="font-sans">
      {/* ── EVENT HERO ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 opacity-[0.04]">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            href="/events"
            className="group mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#e8c49a] transition hover:text-white"
          >
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            All events
          </Link>

          <div className="flex flex-wrap items-start gap-6">
            {/* Large date badge */}
            <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-[#e8c49a]">
                {formatMonth(event.startTime)}
              </span>
              <span className="font-serif text-4xl font-bold leading-none text-white">
                {formatDay(event.startTime)}
              </span>
              <span className="mt-0.5 text-xs font-medium text-[#e6c79c]">
                {formatYear(event.startTime)}
              </span>
            </div>

            <div className="flex-1">
              {/* Type badge */}
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#e8c49a]">
                {event.type?.name || "Event"}
              </span>

              <h1 className="font-serif mt-3 text-3xl font-semibold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              {/* Quick time + location line */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-[#e6c79c]">
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatTime(event.startTime)}
                </div>
                {event.location && (
                  <>
                    <div className="h-4 w-px self-center bg-white/10" />
                    <div className="flex items-center gap-2 text-sm text-[#e6c79c]">
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
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
                      {event.location}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENT DETAILS ─────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* Time details card */}
          <div className="overflow-hidden rounded-2xl border border-[#e8c49a] bg-white">
            <div className="border-b border-[#faebd7] bg-[#fdf6ee] px-6 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c2620a]">
                When & where
              </p>
            </div>
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="flex items-start gap-4 border-b border-[#faebd7] p-6 sm:border-b-0 sm:border-r">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#faebd7] text-[#4a2008]">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8c6d3f]">
                    Starts
                  </p>
                  <p className="mt-1 font-semibold text-[#4a2008]">
                    {formatFull(event.startTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 border-b border-[#faebd7] p-6 sm:border-b-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#faebd7] text-[#4a2008]">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8c6d3f]">
                    Ends
                  </p>
                  <p className="mt-1 font-semibold text-[#4a2008]">
                    {formatFull(event.endTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 sm:col-span-2 sm:border-t sm:border-[#faebd7]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#faebd7] text-[#4a2008]">
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
                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8c6d3f]">
                    Location
                  </p>
                  <p className="mt-1 font-semibold text-[#4a2008]">
                    {event.location || "To be announced"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description card */}
          {event.description && (
            <div className="overflow-hidden rounded-2xl border border-[#e8c49a] bg-white">
              <div className="border-b border-[#faebd7] bg-[#fdf6ee] px-6 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#c2620a]">
                  About this event
                </p>
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-[15px] leading-8 text-[#5c3018]">
                  {event.description}
                </p>
              </div>
            </div>
          )}

          {/* Share / add to calendar row */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e8c49a] bg-white px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c2620a]">
                Don't miss it
              </p>
              <p className="mt-0.5 text-sm text-[#6b4c2a]">
                Share this event with friends and family.
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-[#e8c49a] bg-[#fdf6ee] px-4 py-2 text-sm font-semibold text-[#4a2008] transition hover:border-[#7c3d0f]/20 hover:shadow-sm">
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share event
            </button>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#e8c49a] bg-[#fdf6ee] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
            See what else is on
          </p>
          <h2 className="font-serif mt-3 text-3xl font-semibold text-[#4a2008]">
            More gatherings await
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-[#6b4c2a]">
            There's always something happening at Red Cross. Browse all upcoming
            events or get in touch if you have questions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="rounded-lg bg-[#c2620a] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7c3d0f]"
            >
              All events
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-[#e8c49a] bg-white px-6 py-3.5 text-sm font-semibold text-[#4a2008] transition hover:border-[#7c3d0f]/30 hover:shadow-sm"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
