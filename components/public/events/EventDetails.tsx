import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiCalendar,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";
import { loadPublicEvent } from "@/lib/public-api/event-details";
import {
  eventEnquiryHref,
  eventHref,
  eventsReturnHref,
  eventState,
} from "@/lib/utils/public-events";
import {
  prepareMessageBody,
  messageExcerpt,
} from "@/lib/utils/public-message-body";
import { formatChurchDate } from "@/lib/utils/church-date";
import { ShareButton } from "@/components/public/ShareButton";
import { ScripturePassages } from "@/components/public/ScripturePassages";

export async function eventMetadata(address: string): Promise<Metadata> {
  const result = await loadPublicEvent(address);
  if (result.state !== "ready")
    return {
      title: "Event unavailable",
      robots: { index: false, follow: true },
    };
  const { event } = result;
  const description = messageExcerpt(
    prepareMessageBody(event.description || "").text ||
      `Find the date, time and venue for ${event.title} at Church of Christ at Red Cross.`,
    155,
  );
  return {
    title: event.title,
    alternates: { canonical: eventHref(event.slug) },
    description,
    openGraph: { title: event.title, description, type: "website" },
  };
}
export async function EventDetails({
  address,
  from: source,
}: {
  address: string;
  from?: unknown;
}) {
  const result = await loadPublicEvent(address),
    from = eventsReturnHref(source);
  if (result.state === "missing") notFound();
  if (result.state === "unavailable")
    return (
      <section className="public-container public-section">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" />
          Back to events
        </Link>
        <h1 className="public-display mt-6 max-w-2xl text-4xl leading-tight sm:text-5xl">
          This event could not load.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
          Please try again, or ask the church team about the gathering.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={eventHref(address)} method="GET">
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
  const { event } = result;
  if (event.slug !== address) permanentRedirect(eventHref(event.slug, from));
  const state = eventState(event, result.checkedAt),
    description = prepareMessageBody(event.description || "");
  const fullDate = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  } as const;
  return (
    <>
      <section className="public-container public-section-tight">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" />
          Back to events
        </Link>
        <div className="public-detail-grid">
          <header className="public-detail-intro min-w-0">
            <p className="public-eyebrow">
              {event.type?.name || "Church gathering"}
            </p>
            <h1 className="public-display mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] wrap-anywhere">
              {event.title}
            </h1>
            <p className="mt-5 inline-block rounded-full bg-[#eee6d9] px-4 py-2 text-sm font-semibold">
              {state === "past"
                ? "Past event"
                : state === "ongoing"
                  ? "In progress"
                  : "Upcoming gathering"}
            </p>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
              {state === "past"
                ? "This gathering has ended. Explore upcoming events or ask the church team about similar opportunities to take part."
                : "Make time to come together. Find the gathering details here and ask the church team if you have questions before attending."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={state === "past" ? "/events" : "/contact"}
                className="public-button public-button-primary"
              >
                {state === "past"
                  ? "Find upcoming events"
                  : "Ask about attending"}
                <FiArrowRight aria-hidden="true" />
              </Link>
              <ShareButton
                title={event.title}
                path={eventHref(event.slug)}
                label="Share this event"
              />
            </div>
          </header>
          <section
            aria-label="When and where"
            className="public-detail-facts min-w-0 rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-6"
          >
            <h2 className="public-display text-2xl">When &amp; where</h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--public-muted)]">
                  Starts
                </dt>
                <dd className="mt-1 text-base leading-7">
                  <time dateTime={event.startTime}>
                    {formatChurchDate(event.startTime, fullDate)}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-[var(--public-muted)]">
                  Ends
                </dt>
                <dd className="mt-1 text-base leading-7">
                  <time dateTime={event.endTime}>
                    {formatChurchDate(event.endTime, fullDate)}
                  </time>
                </dd>
              </div>
              <div className="border-t border-[var(--public-line)] pt-4">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--public-muted)]">
                  <FiMapPin aria-hidden="true" />
                  Venue
                </dt>
                <dd className="mt-1 text-base leading-7 wrap-anywhere">
                  {event.location?.trim() ||
                    "The venue has not been added. Please confirm it with the church team before attending."}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-xs leading-5 text-[var(--public-muted)]">
              All times are local to Malawi (CAT, UTC+02:00).
            </p>
            {state !== "past" && (
              <div className="mt-5 border-t border-[var(--public-line)] pt-4">
                <a
                  href={eventHref(event.slug) + "/calendar"}
                  download="red-cross-event.ics"
                  className="public-button public-button-secondary w-full"
                >
                  <FiCalendar aria-hidden="true" className="shrink-0" />
                  Add to calendar
                </a>
                <p className="mt-3 text-xs leading-5 text-[var(--public-muted)]">
                  Downloads a calendar file. Download it again if the event
                  details change.
                </p>
              </div>
            )}
          </section>
          <article className="public-detail-body border-t border-[var(--public-line)] pt-6 min-w-0">
            <p className="public-eyebrow">The gathering</p>
            <h2 className="public-display mt-4 text-3xl leading-tight sm:text-4xl">
              About this event.
            </h2>
            {description.hasContent ? (
              <>
                <div className="public-message-body mt-7">
                  <div dangerouslySetInnerHTML={{ __html: description.html }} />
                </div>
                {description.scriptures.length > 0 && (
                  <section
                    id="message-scriptures"
                    className="mt-8 scroll-mt-32"
                  >
                    <h3 className="text-base font-semibold">
                      Scripture references
                    </h3>
                    <ScripturePassages references={description.scriptures} />
                  </section>
                )}
              </>
            ) : (
              <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--public-muted)]">
                A fuller description has not been added yet. Please contact the
                church team about the gathering, what to expect and anything you
                may need to bring.
              </p>
            )}
          </article>
          <aside className="public-detail-support min-w-0">
            <section className="rounded-2xl bg-[var(--brand-soft)] p-6">
              <h2 className="public-display text-2xl">Have a question?</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
                Ask the church team about this event, the venue or how to take
                part.
              </p>
              <a
                href={eventEnquiryHref(event)}
                className="public-button public-button-primary mt-5 w-full"
              >
                <FiMessageCircle aria-hidden="true" className="shrink-0" />
                Ask on WhatsApp
                <FiArrowUpRight aria-hidden="true" className="shrink-0" />
              </a>
              <Link href="/contact" className="public-text-link mt-4">
                Other ways to contact us
                <FiArrowRight aria-hidden="true" />
              </Link>
            </section>
            {event.ministries.length > 0 && (
              <section className="mt-8">
                <h2 className="public-display text-2xl">
                  Connected ministries
                </h2>
                <ul className="mt-4 divide-y divide-[var(--public-line)] border-y border-[var(--public-line)]">
                  {event.ministries.map((group) => (
                    <li key={group.id}>
                      <Link
                        href={"/ministries/" + encodeURIComponent(group.slug)}
                        className="public-text-link w-full justify-between py-4"
                      >
                        <span className="min-w-0 wrap-anywhere">
                          {group.name}
                        </span>
                        <FiArrowUpRight
                          aria-hidden="true"
                          className="shrink-0"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </section>
      <section className="public-container flex flex-col items-start justify-between gap-7 public-section-tight lg:flex-row lg:items-center">
        <div className="min-w-0 max-w-xl">
          <p className="public-eyebrow">Keep exploring</p>
          <h2 className="public-display mt-3 text-3xl leading-tight sm:text-4xl">
            Find your next shared moment.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
            Explore other gatherings or plan your first Sunday with us.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/events" className="public-button public-button-primary">
            Upcoming events
            <FiArrowRight aria-hidden="true" />
          </Link>
          <Link
            href="/plan-visit"
            className="public-button public-button-secondary"
          >
            Plan a visit
          </Link>
        </div>
      </section>
    </>
  );
}
