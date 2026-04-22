import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicMinistry } from "@/lib/public-api/ministries";

function formatDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric" });
}

function formatMonth(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short" });
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

export default async function PublicMinistryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getPublicMinistry(id);
  const ministry = res.data;

  if (!ministry) {
    notFound();
  }

  return (
    <div className="font-sans">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-screen-2xl">
          <Link
            href="/ministries"
            className="text-sm font-semibold text-[#e8c49a] hover:underline"
          >
            ← Back to ministries
          </Link>

          <div className="mt-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8c49a]">
              Ministry
            </p>

            <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.12] text-white sm:text-5xl lg:text-6xl">
              {ministry.name}
            </h1>

            <p className="mt-6 text-[17px] leading-8 text-[#fde5c0]">
              {ministry.description ||
                "Serving together with purpose and unity in Christ."}
            </p>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#e8c49a] bg-white p-8">
            <h2 className="font-serif text-2xl font-semibold text-[#4a2008]">
              About this ministry
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-[#6b4c2a]">
              {ministry.description ||
                "This ministry provides opportunities to serve, grow spiritually, and build meaningful relationships within the church community."}
            </p>
          </div>
        </div>
      </section>

      {/* ── MINISTRY EVENTS (NEW) ────────────────────────────── */}
      {ministry.events && ministry.events.length > 0 && (
        <section className="bg-[#fdf6ee] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
                Ministry events
              </p>
              <h2 className="font-serif mt-2 text-3xl font-semibold text-[#4a2008] sm:text-4xl">
                Upcoming gatherings
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {ministry.events.map((event, i) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group relative rounded-2xl border border-[#e8c49a] bg-white p-6 transition hover:border-[#7c3d0f]/20 hover:shadow-lg"
                >
                  {/* Ghost number */}
                  <span className="font-serif absolute right-5 top-3 text-6xl font-bold text-[#4a2008]/[0.04]">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Date badge */}
                  <div className="mb-5 inline-flex flex-col items-center rounded-lg border border-[#f0dfc0] bg-[#fdf6ee] px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#c2620a]">
                      {formatMonth(event.startTime)}
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#4a2008]">
                      {formatDay(event.startTime)}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-semibold text-[#4a2008] group-hover:text-[#7c3d0f]">
                    {event.title}
                  </h3>

                  <div className="mt-3 space-y-1 text-sm text-[#6b4c2a]">
                    <p>
                      {formatDayOfWeek(event.startTime)},{" "}
                      {formatTime(event.startTime)}
                    </p>
                    <p>{event.location || "Location to be announced"}</p>
                  </div>

                  <div className="mt-4 text-xs font-semibold text-[#c2620a]">
                    View details →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURE SECTION ─────────────────────────────────── */}
      <section className="bg-[#2b1405] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c49a]">
              Why join
            </p>
            <h2 className="font-serif mt-2 text-3xl font-semibold text-white sm:text-4xl">
              Grow through serving
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Spiritual growth",
                detail:
                  "Serving strengthens your walk with God and deepens your faith.",
              },
              {
                title: "Community",
                detail:
                  "Build lasting relationships and serve alongside others in unity.",
              },
              {
                title: "Purpose",
                detail:
                  "Use your gifts meaningfully to impact lives and glorify God.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
              >
                <h3 className="font-serif text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#e6c79c]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="border-t border-[#e8c49a] bg-[#fdf6ee] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
            Get involved
          </p>

          <h2 className="font-serif mt-3 text-3xl font-semibold text-[#4a2008]">
            Interested in joining?
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-[#6b4c2a]">
            Reach out and we will help you connect with the right team and take
            your next step.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-lg bg-[#c2620a] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#7c3d0f]"
            >
              Contact us
            </Link>

            <Link
              href="/events"
              className="rounded-lg border border-[#e8c49a] bg-white px-6 py-3.5 text-sm font-semibold text-[#4a2008] hover:shadow-sm"
            >
              See events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
