import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiMapPin,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { getPublicPrograms } from "@/lib/public-api/programs";
import {
  PROGRAM_PAGE_SIZE,
  publicProgramPage,
  programsHref,
  programHref,
  programLabel,
  programDateLabel,
  publicProgramTime,
  type ProgramFilters,
  type PublicProgram,
} from "@/lib/utils/public-programs";
import { getProgramDayState } from "@/lib/utils/program-records";
import { ServiceTimes } from "@/components/public/ServiceTimes";
import { ProgramTypeField, ProgramTypeLoading } from "./ProgramTypeField";

export function ProgramDirectory({ filters }: { filters: ProgramFilters }) {
  return (
    <>
      <header className="public-container grid items-start gap-9 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div className="min-w-0">
          <p className="public-eyebrow">Programs · Worship together</p>
          <h1 className="public-display mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
            Follow the service.
            <br />
            Share the moment.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--public-muted)] sm:text-lg">
            Explore the planned order for our services and homecell gatherings.
            Find the date, venue, activities and people helping lead each
            program.
          </p>
          <a
            href="#program-directory"
            className="public-button public-button-primary mt-7"
          >
            Explore programs
            <FiArrowRight aria-hidden="true" />
          </a>
        </div>
        <aside className="public-dark min-w-0 rounded-2xl bg-[var(--brand-dark)] p-6 text-white sm:p-8">
          <p className="public-eyebrow">New to Red Cross?</p>
          <h2 className="public-display mt-3 mb-5 text-3xl leading-tight">
            Join us on Sunday.
          </h2>
          <ServiceTimes dark />
          <Link
            href="/plan-visit"
            className="public-button public-button-light mt-6"
          >
            Plan your first visit
            <FiArrowRight aria-hidden="true" />
          </Link>
        </aside>
      </header>
      <section
        id="program-directory"
        aria-label="Program directory"
        className="public-container scroll-mt-36 pb-14 sm:pb-20"
      >
        <form
          action="/programs"
          method="GET"
          role="search"
          aria-label="Find programs"
          className="grid min-w-0 items-start gap-4 rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_auto]"
        >
          <div className="min-w-0">
            <label
              htmlFor="program-search"
              className="mb-2 block text-sm font-semibold"
            >
              Search type, homecell or venue
            </label>
            <input
              id="program-search"
              type="search"
              name="q"
              maxLength={200}
              defaultValue={filters.q}
              placeholder="Find a program"
              className="public-input"
            />
          </div>
          <Suspense
            key={filters.typeId}
            fallback={<ProgramTypeLoading selected={filters.typeId} />}
          >
            <ProgramTypeField selected={filters.typeId} />
          </Suspense>
          <div className="min-w-0">
            <label
              htmlFor="program-period"
              className="mb-2 block text-sm font-semibold"
            >
              When
            </label>
            <select
              id="program-period"
              name="period"
              defaultValue={filters.period}
              className="public-input"
            >
              <option value="upcoming">Today &amp; upcoming</option>
              <option value="past">Past programs</option>
            </select>
          </div>
          {filters.homecellId && (
            <input type="hidden" name="homecellId" value={filters.homecellId} />
          )}
          <button
            type="submit"
            className="public-button public-button-primary lg:mt-7"
          >
            <FiSearch aria-hidden="true" />
            Find programs
          </button>
        </form>
        <p className="mt-4 text-xs leading-6 text-[var(--public-muted)]">
          Program dates and clock times are local to Malawi. Today&apos;s
          programs stay listed throughout the day.
        </p>
        <ProgramFiltersSummary filters={filters} />
        <div className="mt-9">
          <Suspense
            key={programsHref(filters)}
            fallback={<ProgramResultsLoading />}
          >
            <ProgramResults filters={filters} />
          </Suspense>
        </div>
      </section>
      <section className="border-t border-[var(--public-line)] bg-[var(--brand-soft)]">
        <div className="public-container flex flex-col items-start justify-between gap-7 py-12 lg:flex-row lg:items-center">
          <div className="min-w-0 max-w-xl">
            <p className="public-eyebrow">Take your next step</p>
            <h2 className="public-display mt-3 text-3xl leading-tight sm:text-4xl">
              A place to worship and belong.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              Explore church gatherings, find a homecell, or ask us about
              joining in.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/events"
              className="public-button public-button-primary"
            >
              Explore events
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/homecells"
              className="public-button public-button-secondary"
            >
              Find a homecell
            </Link>
            <Link href="/contact" className="public-text-link">
              Talk to the church team
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
function ProgramFiltersSummary({ filters }: { filters: ProgramFilters }) {
  const active = [
    { label: `Search: ${filters.q}`, active: filters.q, remove: { q: "" } },
    { label: "Program type", active: filters.typeId, remove: { typeId: "" } },
    {
      label: "Homecell programs",
      active: filters.homecellId,
      remove: { homecellId: "" },
    },
    {
      label: "Past programs",
      active: filters.period === "past",
      remove: { period: "upcoming" as const },
    },
  ].filter((item) => item.active);
  if (!active.length) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
      <ul
        aria-label="Active program filters"
        className="flex min-w-0 flex-wrap gap-2"
      >
        {active.map((item) => (
          <li key={item.label} className="min-w-0 max-w-full">
            <Link
              aria-label={`Remove ${item.label}`}
              href={programsHref(filters, { ...item.remove, page: 1 })}
              className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-[var(--public-line)] bg-white px-3 py-2 text-xs leading-5"
            >
              <span className="min-w-0 wrap-anywhere">{item.label}</span>
              <FiX aria-hidden="true" className="shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/programs" className="public-text-link">
        Clear all filters
      </Link>
    </div>
  );
}
export function ProgramResultsLoading() {
  return (
    <p
      role="status"
      className="rounded-2xl border border-[var(--public-line)] bg-white p-6 text-sm leading-7 text-[var(--public-muted)]"
    >
      Loading programs…
    </p>
  );
}
export async function ProgramResults({ filters }: { filters: ProgramFilters }) {
  let result;
  try {
    result = publicProgramPage(
      await getPublicPrograms(
        {
          page: filters.page,
          limit: PROGRAM_PAGE_SIZE,
          search: filters.q,
          period: filters.period,
          typeId: filters.typeId,
          homecellId: filters.homecellId,
        },
        { signal: AbortSignal.timeout(8000) },
      ),
    );
  } catch {
    return (
      <div className="max-w-2xl rounded-2xl border border-[var(--public-line)] bg-white p-6">
        <h2 className="public-display text-3xl">
          The program list could not load.
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          Please try again, or ask the church team about the current service
          program.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <form action="/programs" method="GET">
            {Object.entries({
              page: String(filters.page),
              q: filters.q,
              typeId: filters.typeId,
              homecellId: filters.homecellId,
              period: filters.period,
            })
              .filter(([, value]) => value)
              .map(([name, value]) => (
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
    redirect(programsHref(filters, { page: result.totalPages }));
  const filtered = Boolean(filters.q || filters.typeId || filters.homecellId);
  if (!result.data.length)
    return (
      <div className="max-w-2xl">
        <h2 className="public-display text-3xl">
          {result.total > 0
            ? "The program list has changed."
            : filtered
              ? "No programs match your filters."
              : filters.period === "past"
                ? "No past programs are listed yet."
                : "No programs are listed for today or the days ahead."}
        </h2>
        <p className="mt-4 text-base leading-8 text-[var(--public-muted)]">
          {filtered
            ? "Try a different search or remove a filter to explore more programs."
            : "Please ask the church team about the planned service. Our regular Sunday service information is available above."}
        </p>
        <Link
          href={
            filtered
              ? programsHref(filters, {
                  page: 1,
                  q: "",
                  typeId: "",
                  homecellId: "",
                })
              : "/contact"
          }
          className="public-text-link mt-4"
        >
          {filtered
            ? filters.period === "past"
              ? "Browse all past programs"
              : "Browse all upcoming programs"
            : "Talk to the church team"}
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  return (
    <>
      <p className="mb-6 text-sm leading-7 text-[var(--public-muted)]">
        {result.total} program{result.total === 1 ? "" : "s"}
        {filtered
          ? " matching your filters"
          : filters.period === "past"
            ? " from past dates"
            : " for today and the days ahead"}{" "}
        · Page {filters.page} of {result.totalPages}
      </p>
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {result.data.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            filters={filters}
            now={result.checkedAt}
          />
        ))}
      </ul>
      <ProgramPagination filters={filters} totalPages={result.totalPages} />
    </>
  );
}
export function ProgramCard({
  program,
  filters,
  now,
}: {
  program: PublicProgram;
  filters: ProgramFilters;
  now: number;
}) {
  const href = programHref(program.slug, programsHref(filters));
  return (
    <li className="flex min-w-0 flex-col rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-7">
      <p className="public-eyebrow">
        {getProgramDayState(program.date, new Date(now)).label}
      </p>
      <h2 className="public-display mt-4 text-2xl leading-snug wrap-anywhere sm:text-3xl">
        <Link href={href} className="hover:text-[var(--public-accent)]">
          {programLabel(program)}
        </Link>
      </h2>
      <p className="mt-3 text-sm font-semibold leading-7">
        <time dateTime={program.date}>{programDateLabel(program)}</time>
      </p>
      <p className="mt-3 flex items-start gap-2 text-sm leading-7 text-[var(--public-muted)]">
        <FiMapPin aria-hidden="true" className="mt-1.5 shrink-0" />
        <span className="min-w-0 wrap-anywhere">
          {program.location?.trim() || "Ask the church team about the venue."}
        </span>
      </p>
      <div className="mt-5 border-t border-[var(--public-line)] pt-4">
        <p className="text-xs font-semibold text-[var(--public-muted)]">
          {program.items.length
            ? `${program.items.length} planned activit${program.items.length === 1 ? "y" : "ies"}`
            : "Activities are still to come"}
        </p>
        {program.items.length > 0 && (
          <ol aria-label="Program preview" className="mt-3 space-y-3">
            {program.items.slice(0, 3).map((item) => (
              <li key={item.id} className="min-w-0">
                <p className="text-sm font-medium leading-6 wrap-anywhere">
                  {item.title.trim() || "Program activity"}
                </p>
                <p className="mt-1 text-xs leading-6 text-[var(--public-muted)] wrap-anywhere">
                  {publicProgramTime(item.time).label}
                </p>
              </li>
            ))}
          </ol>
        )}
        {program.items.length > 3 && (
          <p className="mt-3 text-xs leading-6 text-[var(--public-muted)]">
            Plus {program.items.length - 3} more in the full program.
          </p>
        )}
      </div>
      <div className="mt-auto pt-6">
        <Link
          href={href}
          aria-label={`Read ${programLabel(program)} on ${programDateLabel(program)}`}
          className="public-text-link w-full justify-between border-t border-[var(--public-line)] pt-5"
        >
          Read the program
          <FiArrowUpRight aria-hidden="true" className="shrink-0" />
        </Link>
      </div>
    </li>
  );
}
function ProgramPagination({
  filters,
  totalPages,
}: {
  filters: ProgramFilters;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Program pages"
      className="mt-10 flex flex-wrap items-center justify-between gap-3"
    >
      <div>
        {filters.page > 1 && (
          <Link
            rel="prev"
            href={programsHref(filters, { page: filters.page - 1 })}
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
            href={programsHref(filters, { page: filters.page + 1 })}
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
