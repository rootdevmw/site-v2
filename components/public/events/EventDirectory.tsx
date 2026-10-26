import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiClock,
  FiMapPin,
  FiSearch,
} from "react-icons/fi";
import { getPublicEvents } from "@/lib/public-api/events";
import {
  EVENT_PAGE_SIZE,
  publicEventPage,
  eventsHref,
  eventHref,
  eventState,
  type EventFilters,
  type PublicEvent,
} from "@/lib/utils/public-events";
import { formatChurchDate } from "@/lib/utils/church-date";
import {
  messageExcerpt,
  prepareMessageBody,
} from "@/lib/utils/public-message-body";
import { ServiceTimes } from "@/components/public/ServiceTimes";
import { homecellGathering } from "@/config/church";

export function EventDirectory({ filters }: { filters: EventFilters }) {
  return (
    <>
      <header className="public-container grid gap-8 public-section-tight lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-10">
        <div className="min-w-0">
          <p className="public-eyebrow">Events · Come together</p>
          <h1 className="public-display mt-5 max-w-3xl text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
            Faith, friendship,
            <br />
            and shared moments.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--public-muted)] sm:text-lg">
            Find gatherings at Red Cross, make time to be together, and discover
            your next step in our church community.
          </p>
          <a
            href="#event-directory"
            className="public-button public-button-primary mt-7"
          >
            Explore gatherings <FiArrowRight aria-hidden="true" />
          </a>
        </div>
        <div className="min-w-0 border-l-2 border-[var(--public-accent)] pl-6">
          <p className="public-eyebrow">Your first visit</p>
          <h2 className="public-display mt-3 text-3xl leading-tight">
            A warm welcome awaits.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
            You are welcome to join our Sunday worship. Find service times,
            directions and what to expect before you arrive.
          </p>
          <Link href="/plan-visit" className="public-text-link mt-4">
            Plan your visit <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </header>
      <section
        id="event-directory"
        aria-label="Event directory"
        className="public-container scroll-mt-32 public-section-end"
      >
        <form
          action="/events"
          method="GET"
          role="search"
          aria-label="Find events"
          className="grid min-w-0 items-end gap-4 rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.5fr)_auto]"
        >
          <div className="min-w-0">
            <label
              htmlFor="event-search"
              className="mb-2 block text-sm font-semibold"
            >
              Search by title or location
            </label>
            <input
              id="event-search"
              type="search"
              name="q"
              maxLength={200}
              defaultValue={filters.q}
              placeholder="Find a gathering"
              className="public-input"
            />
          </div>
          <div className="min-w-0">
            <label
              htmlFor="event-period"
              className="mb-2 block text-sm font-semibold"
            >
              When
            </label>
            <select
              id="event-period"
              name="period"
              defaultValue={filters.period}
              className="public-input"
            >
              <option value="upcoming">Upcoming &amp; in progress</option>
              <option value="past">Past events</option>
            </select>
          </div>
          <button type="submit" className="public-button public-button-primary">
            <FiSearch aria-hidden="true" />
            Find events
          </button>
        </form>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm leading-7">
          <p className="min-w-0 wrap-anywhere">
            {filters.period === "past"
              ? "Showing past gatherings"
              : "Upcoming gatherings, including those in progress"}
            {filters.q && (
              <>
                {" "}
                · Search: <strong>{filters.q}</strong>
              </>
            )}
          </p>
          {(filters.q || filters.period === "past") && (
            <Link href="/events" className="public-text-link">
              Clear filters
            </Link>
          )}
        </div>
        <div className="mt-9">
          <Suspense
            key={eventsHref(filters)}
            fallback={<EventResultsLoading />}
          >
            <EventResults filters={filters} />
          </Suspense>
        </div>
      </section>
    <section className="public-dark bg-[var(--brand-dark)] text-white">
        <div className="public-container public-section grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
          <div className="min-w-0">
            <p className="public-eyebrow text-[var(--brand-gold)]">Our regular rhythm</p>
            <h2 className="public-display mt-4 text-3xl leading-tight sm:text-4xl">
              Join us on Sunday.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-stone-300">
              Alongside special gatherings, our church family meets each week
              for worship, Scripture and fellowship.
            </p>
            <Link
              href="/plan-visit"
              className="public-button public-button-light mt-6"
            >
              Service and visit information <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="min-w-0 rounded-2xl border border-white/20 p-5 sm:p-6">
            <h3 className="public-display mb-5 text-2xl">Sunday worship</h3>
            <ServiceTimes dark />
            <div className="mt-7 border-t border-white/20 pt-6">
              <h3 className="text-base font-semibold">Homecell prayers</h3>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                {homecellGathering.day}s at {homecellGathering.time} · Malawi
                time. {homecellGathering.note}
              </p>
              <Link
                href="/homecells"
                className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#f0d5af] underline underline-offset-4"
              >
                Find a homecell <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
export function EventResultsLoading() {
  return (
    <p
      role="status"
      className="rounded-2xl border border-[var(--public-line)] bg-white p-6 text-sm leading-7 text-[var(--public-muted)]"
    >
      Loading gatherings…
    </p>
  );
}
export async function EventResults({ filters }: { filters: EventFilters }) {
  let result;
  try {
    result = publicEventPage(
      await getPublicEvents(
        {
          page: filters.page,
          limit: EVENT_PAGE_SIZE,
          search: filters.q,
          period: filters.period,
        },
        { signal: AbortSignal.timeout(8000) },
      ),
    );
  } catch {
    return (
      <div className="max-w-2xl rounded-2xl border border-[var(--public-line)] bg-white p-6">
        <h2 className="public-display text-3xl">
          The event list could not load.
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          Please try again, or contact the church team about current gatherings.
          Our regular service information is still available below.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <form action="/events" method="GET">
            {Object.entries({
              page: String(filters.page),
              q: filters.q,
              period: filters.period,
            }).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
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
      </div>
    );
  }
  if (filters.page > result.totalPages)
    redirect(eventsHref(filters, { page: result.totalPages }));
  if (!result.data.length)
    return (
      <div className="max-w-2xl">
        <h2 className="public-display text-3xl">
          {result.total > 0
            ? "The event list has changed."
            : filters.q
              ? "No events match that search."
              : filters.period === "past"
                ? "No past events are listed yet."
                : "No upcoming events are listed right now."}
        </h2>
        <p className="mt-4 text-base leading-8 text-[var(--public-muted)]">
          {filters.q
            ? "Try a different title or location, or clear the search."
            : "Please ask the church team about current activities. You are also welcome to join us for our regular Sunday worship."}
        </p>
        <Link
          href={
            filters.q ? eventsHref(filters, { page: 1, q: "" }) : "/contact"
          }
          className="public-text-link mt-4"
        >
          {filters.q ? "Clear search" : "Talk to the church team"}
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  return (
    <>
      <p className="mb-6 text-sm leading-7 text-[var(--public-muted)]">
        {result.total}{" "}
        {filters.period === "past" ? "past" : "upcoming / in-progress"} event
        {result.total === 1 ? "" : "s"}
        {filters.q ? " matching your search" : ""} · Page {filters.page} of{" "}
        {result.totalPages}
      </p>
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {result.data.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            filters={filters}
            now={result.checkedAt}
          />
        ))}
      </ul>
      <EventPagination filters={filters} totalPages={result.totalPages} />
    </>
  );
}
export function EventCard({
  event,
  filters,
  now,
}: {
  event: PublicEvent;
  filters: EventFilters;
  now: number;
}) {
  const status = eventState(event, now),
    description = messageExcerpt(
      prepareMessageBody(event.description || "").text,
      160,
    );
  return (
    <li className="flex min-w-0 flex-col rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="rounded-xl bg-[var(--brand-soft)] px-4 py-3 text-center">
          <span className="block text-xs font-semibold uppercase tracking-widest text-[var(--public-muted)]">
            {formatChurchDate(event.startTime, { month: "short" })}
          </span>
          <span className="public-display mt-1 block text-4xl">
            {formatChurchDate(event.startTime, { day: "numeric" })}
          </span>
          <span className="mt-1 block text-xs text-[var(--public-muted)]">
            {formatChurchDate(event.startTime, { year: "numeric" })}
          </span>
        </div>
        <span className="max-w-full rounded-full bg-[var(--brand-soft)] px-3 py-2 text-xs font-semibold wrap-anywhere">
          {status === "ongoing"
            ? "In progress"
            : status === "past"
              ? "Past event"
              : event.type?.name || "Gathering"}
        </span>
      </div>
      <h2 className="public-display mt-5 text-2xl leading-snug wrap-anywhere sm:text-3xl">
        <Link
          href={eventHref(event.slug, eventsHref(filters))}
          className="hover:text-[var(--public-accent)]"
        >
          {event.title}
        </Link>
      </h2>
      <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--public-muted)]">
        <p className="flex items-start gap-2">
          <FiClock aria-hidden="true" className="mt-1.5 shrink-0" />
          <time dateTime={event.startTime}>
            {formatChurchDate(event.startTime, {
              weekday: "long",
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            CAT
          </time>
        </p>
        <p className="flex items-start gap-2">
          <FiMapPin aria-hidden="true" className="mt-1.5 shrink-0" />
          <span className="min-w-0 wrap-anywhere">
            {event.location?.trim() || "Ask the church team about the venue."}
          </span>
        </p>
      </div>
      {description && (
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
          {description}
        </p>
      )}
      <div className="mt-auto pt-6">
        <Link
          href={eventHref(event.slug, eventsHref(filters))}
          aria-label={`View ${event.title}`}
          className="public-text-link w-full justify-between border-t border-[var(--public-line)] pt-5"
        >
          Event details{" "}
          <FiArrowUpRight aria-hidden="true" className="shrink-0" />
        </Link>
      </div>
    </li>
  );
}
function EventPagination({
  filters,
  totalPages,
}: {
  filters: EventFilters;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Event pages"
      className="mt-8 flex flex-wrap items-center justify-between gap-3"
    >
      <div>
        {filters.page > 1 && (
          <Link
            rel="prev"
            href={eventsHref(filters, { page: filters.page - 1 })}
            className="public-button public-button-secondary"
          >
            <FiArrowLeft aria-hidden="true" />
            Previous
          </Link>
        )}
      </div>
      <p className="order-first w-full min-w-0 text-center text-xs leading-6 text-[var(--public-muted)] sm:order-none sm:w-auto">
        Page {filters.page} of {totalPages}
      </p>
      <div>
        {filters.page < totalPages && (
          <Link
            rel="next"
            href={eventsHref(filters, { page: filters.page + 1 })}
            className="public-button public-button-secondary"
          >
            Next
            <FiArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>
    </nav>
  );
}
