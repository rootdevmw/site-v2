import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiClock,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";
import { loadPublicGroup } from "@/lib/public-api/groups";
import {
  groupEnquiryHref,
  groupHref,
  groupPeople,
  groupReturnHref,
  upcomingGroupEvents,
  upcomingGroupPrograms,
  type PublicGroup,
  type PublicGroupKind,
} from "@/lib/utils/public-groups";
import {
  prepareMessageBody,
  messageExcerpt,
} from "@/lib/utils/public-message-body";
import { formatChurchDate } from "@/lib/utils/church-date";
import { homecellGathering } from "@/config/church";
import { LeaderPortrait } from "@/components/public/LeaderPortrait";
import { ScripturePassages } from "@/components/public/ScripturePassages";

export async function publicGroupMetadata(
  kind: PublicGroupKind,
  address: string,
): Promise<Metadata> {
  const result = await loadPublicGroup(kind, address);
  if (result.state !== "ready")
    return {
      title:
        kind === "ministry" ? "Ministry unavailable" : "Homecell unavailable",
      robots: { index: false, follow: true },
    };
  const { group } = result;
  const description = messageExcerpt(
    group.kind === "ministry"
      ? prepareMessageBody(group.purpose || group.description || "").text ||
          `Learn about ${group.name} at Church of Christ at Red Cross and ask the church team about taking part.`
      : `Explore ${group.name} homecell at Church of Christ at Red Cross. Find programs, learn about the group and ask the church team about joining.`,
    155,
  );
  return {
    title: group.name,
    alternates: { canonical: groupHref(kind, group.slug) },
    description,
    openGraph: { title: group.name, description, type: "website" },
  };
}
export async function GroupDetails({
  kind,
  address,
  from: source,
}: {
  kind: PublicGroupKind;
  address: string;
  from?: unknown;
}) {
  const from = groupReturnHref(kind, source),
    result = await loadPublicGroup(kind, address);
  if (result.state === "missing") notFound();
  if (result.state === "unavailable")
    return (
      <section className="public-container public-section">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" />
          Back to {kind === "ministry" ? "ministries" : "homecells"}
        </Link>
        <h1 className="public-display mt-6 max-w-2xl text-4xl leading-tight sm:text-5xl">
          This {kind} could not load.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
          Please try again, or contact the church team for help getting
          connected.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={groupHref(kind, address)} method="GET">
            <input type="hidden" name="from" value={from} />
            <button
              type="submit"
              className="public-button public-button-primary"
            >
              Try again
            </button>
          </form>
          <Link
            href="/contact"
            className="public-button public-button-secondary"
          >
            Contact the church
          </Link>
        </div>
      </section>
    );
  const { group } = result;
  if (group.slug !== address)
    permanentRedirect(groupHref(kind, group.slug, from));
  const description =
    group.kind === "ministry"
      ? prepareMessageBody(group.description || "")
      : null;
  const purpose =
    group.kind === "ministry"
      ? prepareMessageBody(group.purpose || "").text
      : "A smaller community for prayer, encouragement and growing together in faith.";
  const people = groupPeople(group);
  return (
    <>
      <header className="public-container py-10 sm:py-14">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" />
          Back to {kind === "ministry" ? "ministries" : "homecells"}
        </Link>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <p className="public-eyebrow">
              {kind === "ministry"
                ? "Serve with us · Ministry"
                : "Life together · Homecell"}
            </p>
            <h1 className="public-display mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] wrap-anywhere">
              {group.name}
            </h1>
            {purpose && (
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--public-muted)] wrap-anywhere sm:text-lg">
                {purpose}
              </p>
            )}
            {group.kind === "homecell" && (
              <p className="mt-4 flex items-start gap-2 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
                <FiMapPin aria-hidden="true" className="mt-1 shrink-0" />
                <span className="min-w-0">
                  {group.location?.trim() ||
                    "Please ask the church team about the meeting place."}
                </span>
              </p>
            )}
          </div>
          <div className="min-w-0 rounded-2xl border border-[var(--public-line)] bg-white p-6">
            <h2 className="public-display text-2xl">
              Interested in taking part?
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--public-muted)]">
              Ask the church team about this {kind} and what your next step
              could be.
            </p>
            <a
              href={groupEnquiryHref(group)}
              className="public-button public-button-primary mt-5 w-full"
            >
              <FiMessageCircle aria-hidden="true" className="shrink-0" />
              Ask on WhatsApp{" "}
              <FiArrowUpRight aria-hidden="true" className="shrink-0" />
            </a>
            <Link href="/contact" className="public-text-link mt-3">
              Other ways to contact us <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>
      <section className="border-y border-[var(--public-line)] bg-white">
        <div className="public-container public-section grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div className="min-w-0">
            <p className="public-eyebrow">Get to know the group</p>
            <h2 className="public-display mt-4 text-3xl leading-tight sm:text-4xl">
              {kind === "ministry"
                ? "A purpose to share."
                : "Faith grows in community."}
            </h2>
          </div>
          <div className="min-w-0">
            {group.kind === "ministry" ? (
              description?.hasContent ? (
                <>
                  <div className="public-message-body">
                    <div
                      dangerouslySetInnerHTML={{ __html: description.html }}
                    />
                  </div>
                  {description.scriptures.length > 0 && (
                    <section
                      id="message-scriptures"
                      className="mt-8 scroll-mt-36"
                    >
                      <h3 className="text-base font-semibold">
                        Scripture references
                      </h3>
                      <ScripturePassages references={description.scriptures} />
                    </section>
                  )}
                </>
              ) : (
                <p className="max-w-2xl text-base leading-8 text-[var(--public-muted)]">
                  A fuller description has not been added here yet. The church
                  team can help you learn more about the ministry and
                  opportunities to take part.
                </p>
              )
            ) : (
              <>
                <p className="max-w-2xl text-base leading-8 text-[var(--public-muted)]">
                  Homecell prayers are a way to share burdens, encourage one
                  another and grow in faith. Speak to the church team about
                  visiting this group and confirming the current venue.
                </p>
                <div className="mt-6 rounded-xl bg-[#f3eee5] p-5 sm:p-6">
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    <FiClock aria-hidden="true" />
                    Our usual homecell rhythm
                  </h3>
                  <p className="mt-3 text-sm leading-7">
                    {homecellGathering.day}s at {homecellGathering.time} ·
                    Malawi time
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--public-muted)]">
                    {homecellGathering.note} Check the group&apos;s current
                    program or ask the church team before visiting.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <section className="public-container public-section">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="public-eyebrow">
              {kind === "ministry" ? "Gatherings" : "Group programs"}
            </p>
            <h2 className="public-display mt-4 text-3xl leading-tight sm:text-4xl">
              {kind === "ministry" ? "Coming together." : "What is coming up."}
            </h2>
          </div>
          <Link
            href={kind === "ministry" ? "/events" : "/programs"}
            className="public-text-link"
          >
            {kind === "ministry" ? "All church events" : "All church programs"}
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
        <GroupSchedule group={group} now={result.checkedAt} />
      </section>
      <section className="border-y border-[var(--public-line)] bg-[#f3eee5]">
        <div className="public-container public-section">
          <p className="public-eyebrow">People &amp; care</p>
          <h2 className="public-display mt-4 text-3xl leading-tight sm:text-4xl">
            Meet the group leadership.
          </h2>
          {people.length ? (
            <ul
              className={`mt-8 grid gap-6 ${people.length > 1 ? "md:grid-cols-2" : "max-w-xl"}`}
            >
              {people.map((person) => (
                <li
                  key={person.id}
                  className="min-w-0 rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-7"
                >
                  <div className="max-w-48">
                    <LeaderPortrait
                      imageUrl={person.imageUrl}
                      initials={person.initials}
                    />
                  </div>
                  <p className="public-eyebrow mt-5">
                    {person.roles.join(" & ")}
                  </p>
                  <h3 className="public-display mt-2 text-2xl leading-snug wrap-anywhere">
                    {person.name}
                  </h3>
                  {person.bio && (
                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
                      {person.bio}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--public-muted)]">
              Leadership details have not been added here yet. Please contact
              the church team if you would like to meet someone from this group.
            </p>
          )}
        </div>
      </section>
      <section className="public-container flex flex-col items-start justify-between gap-7 py-12 lg:flex-row lg:items-center">
        <div className="min-w-0 max-w-xl">
          <p className="public-eyebrow">Your next step</p>
          <h2 className="public-display mt-3 text-3xl leading-tight sm:text-4xl">
            Let&apos;s get connected.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
            Ask us about visiting, taking part or finding a group that fits your
            interests.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={groupEnquiryHref(group)}
            className="public-button public-button-primary"
          >
            Ask about this {kind}
            <FiArrowUpRight aria-hidden="true" />
          </a>
          <Link href={from} className="public-button public-button-secondary">
            Explore other {kind === "ministry" ? "ministries" : "homecells"}
          </Link>
        </div>
      </section>
    </>
  );
}
export function GroupSchedule({
  group,
  now,
}: {
  group: PublicGroup;
  now: number;
}) {
  if (group.kind === "ministry") {
    const events = upcomingGroupEvents(group, now);
    return events.length ? (
      <ul className="mt-8 divide-y divide-[var(--public-line)] border-y border-[var(--public-line)]">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={"/events/" + encodeURIComponent(event.slug)}
              className="flex min-w-0 items-start justify-between gap-5 py-6"
            >
              <div className="min-w-0">
                <h3 className="text-lg font-semibold wrap-anywhere">
                  {event.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--public-muted)]">
                  <time dateTime={new Date(event.startTime).toISOString()}>
                    {formatChurchDate(event.startTime, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>{" "}
                  CAT
                  {new Date(event.startTime).getTime() <= now && (
                    <span className="ml-3 font-semibold text-[var(--public-accent)]">
                      In progress
                    </span>
                  )}
                </p>
                {event.location && (
                  <p className="mt-1 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
                    {event.location}
                  </p>
                )}
              </div>
              <FiArrowUpRight
                aria-hidden="true"
                className="mt-1 size-5 shrink-0"
              />
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--public-muted)]">
        No upcoming gatherings are listed for this ministry right now. Ask the
        church team about its current activities, or explore other church
        events.
      </p>
    );
  }
  const programs = upcomingGroupPrograms(group, now);
  return programs.length ? (
    <ul className="mt-8 divide-y divide-[var(--public-line)] border-y border-[var(--public-line)]">
      {programs.map((program) => (
        <li key={program.id}>
          <Link
            href={"/programs/" + encodeURIComponent(program.slug)}
            className="flex min-w-0 items-start justify-between gap-5 py-6"
          >
            <div className="min-w-0">
              <h3 className="text-lg font-semibold wrap-anywhere">
                {program.type?.name || "Homecell program"}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--public-muted)]">
                <time dateTime={new Date(program.date).toISOString()}>
                  {formatChurchDate(program.date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </p>
              {program.location && (
                <p className="mt-1 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
                  {program.location}
                </p>
              )}
              <p className="mt-2 text-xs leading-6 text-[var(--public-muted)]">
                Open the program for its schedule and activities.
              </p>
            </div>
            <FiArrowUpRight
              aria-hidden="true"
              className="mt-1 size-5 shrink-0"
            />
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--public-muted)]">
      No specific program is listed for this homecell yet. Ask the church team
      for the next meeting&apos;s venue and details.
    </p>
  );
}
