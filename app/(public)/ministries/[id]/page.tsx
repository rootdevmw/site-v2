import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicMinistry } from "@/lib/public-api/ministries";

/* ---------------- Helpers ---------------- */

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

/* ---------------- Types ---------------- */

type Person = {
  id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  location?: string | null;
  bio?: { bio: string } | null;
};

/* ---------------- Rich Text Styling ---------------- */

const richText =
  "prose prose-sm max-w-none leading-7 " +
  "[&_p]:mb-4 [&_p:last-child]:mb-0 " +
  "[&_ul]:list-disc [&_ul]:pl-6 " +
  "[&_ol]:list-decimal [&_ol]:pl-6 " +
  "[&_a]:underline [&_a]:font-medium " +
  "[&_img]:rounded-xl [&_img]:my-4 [&_img]:mx-auto [&_img]:max-h-80 [&_img]:object-cover " +
  "[&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg " +
  "[&_audio]:w-full [&_audio]:mt-3";

/* ---------------- Leader ---------------- */

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
          className="h-64 w-full overflow-hidden 
          [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:object-top 
          [&_p]:hidden"
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

      <div className="absolute inset-0 h-64 bg-gradient-to-t from-[#1a0d03] via-[#1a0d03]/20 to-transparent" />

      <div className="absolute top-40 left-0 right-0 px-6">
        <span className="block text-[9px] font-sans font-bold uppercase tracking-[0.3em] text-[#e8c49a]/70">
          {role}
        </span>
        <h3 className="text-lg font-bold text-white">
          {formatPrefix(person.prefix)}. {person.firstName} {person.lastName}
        </h3>
      </div>

      {hasBioText && (
        <div className="bg-[#1e0e04] px-6 py-5 flex-1 border-t border-[#e8c49a]/10">
          <div
            className={`font-sans text-sm text-[#fde5c0]/70 ${richText} [&_img]:hidden`}
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

/* ---------------- Page ---------------- */

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
      {/* ---------------- HERO ---------------- */}
      <section className="relative bg-[#2b1405] overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-6 py-10 text-center">
          <Link
            href="/ministries"
            className="inline-block text-xs uppercase tracking-[0.2em] text-[#e8c49a]/70 hover:text-[#e8c49a]"
          >
            ← Ministries
          </Link>

          <h1 className="mt-5 text-3xl sm:text-4xl font-bold text-white">
            {ministry.name}
          </h1>
        </div>
      </section>

      {/* ---------------- ABOUT ---------------- */}
      <section className="bg-[#fdf6ee] px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c2620a] font-semibold">
            About
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#2b1405]">
            {ministry.name}
          </h2>

          <p className="mt-2 text-2xl font-bold text-[#2b1405]">
            {ministry.purpose}
          </p>

          <div className="mt-6 border-y border-[#e8c49a]/40 py-6 text-left">
            {ministry.description ? (
              <div
                className={`${richText} text-[#5c3317]`}
                dangerouslySetInnerHTML={{ __html: ministry.description }}
              />
            ) : (
              <p className="text-center text-[#5c3317]">
                This ministry provides opportunities to serve, grow spiritually,
                and build meaningful relationships within the church community.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- LEADERSHIP ---------------- */}
      {hasLeadership && (
        <section className="bg-[#2b1405]">
          <div className="text-center py-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#e8c49a]/60">
              Leadership
            </p>
            <h2 className="text-xl font-bold text-white mt-2">Meet the team</h2>
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

      {/* ---------------- EVENTS ---------------- */}
      {ministry.events!?.length > 0 && (
        <section className="bg-white px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#c2620a]">
                Gatherings
              </p>
              <h2 className="text-xl font-bold text-[#2b1405] mt-2">
                Upcoming events
              </h2>
            </div>

            <div className="divide-y border-y border-[#e8c49a]/40">
              {ministry.events!.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-6 py-5 hover:bg-[#fdf6ee] transition"
                >
                  <div className="w-14 text-center">
                    <p className="text-xs uppercase text-[#c2620a] font-bold">
                      {formatMonth(event.startTime)}
                    </p>
                    <p className="text-2xl font-bold text-[#2b1405]">
                      {formatDay(event.startTime)}
                    </p>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2b1405]">
                      {event.title}
                    </h3>
                    <p className="text-sm text-[#7a4f2e]">
                      {formatDayOfWeek(event.startTime)},{" "}
                      {formatTime(event.startTime)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- CTA ---------------- */}
      <section className="bg-[#fdf6ee] py-12 text-center">
        <h2 className="text-xl font-bold text-[#2b1405]">
          Interested in joining?
        </h2>
        <p className="mt-3 text-sm text-[#5c3317]">
          Reach out and we will help you connect with the right team.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/contact"
            className="bg-[#c2620a] text-white px-6 py-2 rounded-lg"
          >
            Contact us
          </Link>
          <Link
            href="/events"
            className="border px-6 py-2 rounded-lg text-[#4a2008]"
          >
            See events
          </Link>
        </div>
      </section>
    </div>
  );
}
