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
function formatPrefix(prefix: string) {
  return prefix.charAt(0) + prefix.slice(1).toLowerCase();
}

type Person = {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  location?: string | null;
  bio?: { bio: string } | null;
};

function LeaderPanel({
  person,
  role,
  showDivider,
}: {
  person: Person;
  role: string;
  showDivider?: boolean;
}) {
  const hasBioText =
    person.bio?.bio && person.bio.bio.replace(/<[^>]*>/g, "").trim().length > 0;

  return (
    <div className="relative flex-1 flex flex-col">
      {person.bio?.bio ? (
        <div
          className="h-64 w-full overflow-hidden [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:object-top [&_p]:hidden"
          dangerouslySetInnerHTML={{ __html: person.bio.bio }}
        />
      ) : (
        <div className="h-64 w-full flex items-center justify-center bg-[#3d1e08]">
          <span className="text-6xl font-bold text-[#e8c49a]/20">
            {person.firstName[0]}
            {person.lastName[0]}
          </span>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-t from-[#1a0d03] via-[#1a0d03]/20 to-transparent pointer-events-none" />

      <div className="absolute top-40 left-0 right-0 px-6">
        <span className="inline-block font-sans text-[9px] font-bold uppercase tracking-[0.3em] text-[#e8c49a]/70 mb-1">
          {role}
        </span>
        <h3 className="text-lg font-bold text-white leading-tight">
          {formatPrefix(person.prefix)}. {person.firstName} {person.lastName}
        </h3>
        {person.location && (
          <p className="font-sans text-xs text-[#fde5c0]/50 mt-0.5">
            {person.location}
          </p>
        )}
      </div>

      {hasBioText && (
        <div className="bg-[#1e0e04] px-6 py-5 flex-1 border-t border-[#e8c49a]/10">
          <div
            className="font-sans text-sm leading-7 text-[#fde5c0]/60 [&_img]:hidden [&_p:empty]:hidden"
            dangerouslySetInnerHTML={{ __html: person.bio!.bio }}
          />
        </div>
      )}

      {showDivider && (
        <div className="absolute right-0 top-6 bottom-6 w-px bg-[#e8c49a]/10 hidden sm:block" />
      )}
    </div>
  );
}

export default async function PublicMinistryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getPublicMinistry(id);
  const ministry = res.data;

  if (!ministry) notFound();

  const hasLeadership = ministry.leader || ministry.overseer;

  return (
    <div className="font-serif">
      {/* ① DARK — Hero */}
      <section className="relative bg-[#2b1405] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-16 opacity-[0.035]">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            className="h-[240px] w-[240px]"
          >
            <rect x="85" y="10" width="30" height="180" fill="white" />
            <rect x="10" y="65" width="180" height="30" fill="white" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-4xl px-6 py-8 sm:px-10 lg:px-8">
          <Link
            href="/ministries"
            className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8c49a]/70 hover:text-[#e8c49a] transition-colors"
          >
            ← Ministries
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e8c49a]/20" />
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e8c49a]/50">
              Ministry
            </span>
            <div className="h-px flex-1 bg-[#e8c49a]/20" />
          </div>

          <h1 className="mt-4 text-center text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
            {ministry.name}
          </h1>

          {ministry.description && (
            <p className="mx-auto mt-3 max-w-xl text-center font-sans text-sm leading-7 text-[#fde5c0]/70">
              {ministry.description}
            </p>
          )}

          <div className="mt-6 flex justify-center">
            <svg width="60" height="12" viewBox="0 0 60 12" fill="none">
              <circle cx="6" cy="6" r="2" fill="#e8c49a" fillOpacity="0.4" />
              <line
                x1="12"
                y1="6"
                x2="48"
                y2="6"
                stroke="#e8c49a"
                strokeOpacity="0.3"
                strokeWidth="0.75"
              />
              <circle cx="30" cy="6" r="3" fill="#e8c49a" fillOpacity="0.6" />
              <line
                x1="12"
                y1="6"
                x2="48"
                y2="6"
                stroke="#e8c49a"
                strokeOpacity="0.3"
                strokeWidth="0.75"
              />
              <circle cx="54" cy="6" r="2" fill="#e8c49a" fillOpacity="0.4" />
            </svg>
          </div>
        </div>
      </section>

      {/* ② WARM CREAM — About */}
      <section className="bg-[#fdf6ee] px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c2620a]">
              About
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#2b1405]">
              {ministry.name}
            </h2>
          </div>
          <div className="mt-5 border-t border-b border-[#e8c49a]/50 py-6">
            <p className="text-center font-sans text-[15px] leading-8 text-[#5c3317]">
              {ministry.description ||
                "This ministry provides opportunities to serve, grow spiritually, and build meaningful relationships within the church community."}
            </p>
          </div>
        </div>
      </section>

      {/* ③ DARK — Leadership */}
      {hasLeadership && (
        <section className="relative overflow-hidden bg-[#2b1405]">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#f3e1cf]" />

          <div className="pt-8 pb-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-[#e8c49a]/25" />
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e8c49a]/60">
                Leadership
              </p>
              <div className="h-px w-16 bg-[#e8c49a]/25" />
            </div>
            <h2 className="mt-2 text-xl font-bold text-white">Meet the team</h2>
          </div>

          <div className="flex flex-col sm:flex-row">
            {ministry.leader && (
              <LeaderPanel
                person={ministry.leader}
                role="Leader"
                showDivider={!!ministry.overseer}
              />
            )}
            {ministry.overseer && (
              <LeaderPanel person={ministry.overseer} role="Overseer" />
            )}
          </div>
          <div className="h-16" />
        </section>
      )}

      {/* ④ WHITE — Events */}
      {ministry.events && ministry.events.length > 0 && (
        <section className="bg-white px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c2620a]">
                Gatherings
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#2b1405]">
                Upcoming events
              </h2>
            </div>

            <div className="divide-y divide-[#e8c49a]/40 border-t border-b border-[#e8c49a]/40">
              {ministry.events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group flex items-center gap-6 py-5 px-2 -mx-2 rounded-lg transition hover:bg-[#fdf6ee]"
                >
                  <div className="flex-shrink-0 w-14 text-center">
                    <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-[#c2620a]">
                      {formatMonth(event.startTime)}
                    </p>
                    <p className="text-3xl font-bold leading-none text-[#2b1405]">
                      {formatDay(event.startTime)}
                    </p>
                  </div>
                  <div className="h-10 w-px bg-[#e8c49a] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#2b1405] group-hover:text-[#c2620a] transition-colors truncate">
                      {event.title}
                    </h3>
                    <p className="mt-0.5 font-sans text-sm text-[#7a4f2e]">
                      {formatDayOfWeek(event.startTime)},{" "}
                      {formatTime(event.startTime)}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                  </div>
                  <span className="font-sans text-xs font-semibold text-[#c2620a] group-hover:translate-x-1 transition-transform flex-shrink-0">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ⑤ DARK — Why join */}
      <section className="relative overflow-hidden bg-[#f3e1cf] px-6 py-12 sm:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(194,98,10,0.12),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#c2620a]/15" />

        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-[#c2620a]/20" />
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a55009]">
                Why join
              </p>
              <div className="h-px w-16 bg-[#c2620a]/20" />
            </div>
            <h2 className="mt-2 text-xl font-bold text-[#2b1405]">
              Grow through serving
            </h2>
            <p className="mx-auto mt-3 max-w-2xl font-sans text-sm leading-7 text-[#6b4022]">
              Ministry is not only about filling a role. It is a place to grow,
              belong, and offer what God has placed in your hands.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                title: "Spiritual growth",
                detail:
                  "Serving strengthens your walk with God and deepens your faith.",
                accent: "from-[#fff4e8] to-[#f7dfc4]",
              },
              {
                title: "Community",
                detail:
                  "Build lasting relationships and serve alongside others in unity.",
                accent: "from-[#fff7ef] to-[#f0d8bf]",
              },
              {
                title: "Purpose",
                detail:
                  "Use your gifts meaningfully to impact lives and glorify God.",
                accent: "from-[#fff2e3] to-[#edd0af]",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border border-white/70 bg-gradient-to-br ${item.accent} p-6 text-center shadow-[0_18px_40px_rgba(78,38,10,0.08)]`}
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#c2620a]/15 bg-white/70">
                  <div className="h-3 w-3 rounded-full bg-[#c2620a]/70" />
                </div>
                <div className="mx-auto mt-4 mb-3 h-px w-10 bg-[#c2620a]/20" />
                <h3 className="text-sm font-bold text-[#2b1405]">{item.title}</h3>
                <p className="mt-2 font-sans text-sm leading-6 text-[#6b4022]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ WARM CREAM — CTA */}
      <section className="bg-[#fdf6ee] px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <svg
            className="mx-auto mb-5"
            width="60"
            height="12"
            viewBox="0 0 60 12"
            fill="none"
          >
            <circle cx="6" cy="6" r="2" fill="#c2620a" fillOpacity="0.35" />
            <line
              x1="12"
              y1="6"
              x2="48"
              y2="6"
              stroke="#c2620a"
              strokeOpacity="0.25"
              strokeWidth="0.75"
            />
            <circle cx="30" cy="6" r="3" fill="#c2620a" fillOpacity="0.55" />
            <line
              x1="12"
              y1="6"
              x2="48"
              y2="6"
              stroke="#c2620a"
              strokeOpacity="0.25"
              strokeWidth="0.75"
            />
            <circle cx="54" cy="6" r="2" fill="#c2620a" fillOpacity="0.35" />
          </svg>

          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c2620a]">
            Get involved
          </p>
          <h2 className="mt-2 text-xl font-bold text-[#2b1405]">
            Interested in joining?
          </h2>
          <p className="mt-3 font-sans text-sm leading-7 text-[#5c3317]">
            Reach out and we will help you connect with the right team and take
            your next step.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-[#c2620a] px-7 py-2.5 font-sans text-sm font-semibold text-white hover:bg-[#7c3d0f] transition-colors"
            >
              Contact us
            </Link>
            <Link
              href="/events"
              className="rounded-lg border border-[#e8c49a] bg-white px-7 py-2.5 font-sans text-sm font-semibold text-[#4a2008] hover:bg-white/60 transition-colors"
            >
              See events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
