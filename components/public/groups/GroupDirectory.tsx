import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiClock,
  FiMapPin,
  FiSearch,
} from "react-icons/fi";
import communityPhoto from "@/public/images/community.webp";
import { homecellGathering } from "@/config/church";
import { getPublicMinistries } from "@/lib/public-api/ministries";
import { getPublicHomecells } from "@/lib/public-api/homecells";
import {
  groupPaths,
  groupHref,
  groupsHref,
  publicGroupPage,
  upcomingGroupPrograms,
  PUBLIC_GROUP_PAGE_SIZE,
  type PublicGroup,
  type PublicGroupKind,
  type GroupFilters,
} from "@/lib/utils/public-groups";
import {
  prepareMessageBody,
  messageExcerpt,
} from "@/lib/utils/public-message-body";
import { formatChurchDate } from "@/lib/utils/church-date";
import { Pagination } from "@/components/public/Pagination";

export function GroupDirectory({
  kind,
  filters,
}: {
  kind: PublicGroupKind;
  filters: GroupFilters;
}) {
  const ministries = kind === "ministry";
  return (
    <>
      <section className="public-container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-16">
        <div className="min-w-0">
          <p className="public-eyebrow">
            {ministries
              ? "Ministries · Serve with us"
              : "Homecells · Life together"}
          </p>
          <h1 className="public-display mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
            {ministries ? (
              <>
                Put your gifts
                <br />
                into practice.
              </>
            ) : (
              <>
                A smaller group.
                <br />A shared journey.
              </>
            )}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--public-muted)] sm:text-lg">
            {ministries
              ? "Find a place where your gifts can encourage the church and bless the community. Explore our ministries and talk to us about taking part."
              : "Homecells bring people together for prayer, encouragement and growing in faith. Find a group, explore its programs, and ask the church team about joining."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#group-directory"
              className="public-button public-button-primary"
            >
              {ministries ? "Explore ministries" : "Find a homecell"}
              <FiArrowRight aria-hidden="true" />
            </a>
            <Link href="/contact" className="public-text-link">
              Talk to the church team <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        {ministries ? (
          <figure className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#e7e0d5]">
              <Image
                src={communityPhoto}
                alt="Members of the Red Cross church community together"
                fill
                preload
                placeholder="blur"
                sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 text-xs leading-6 text-[var(--public-muted)]">
              Life together at Red Cross.
            </figcaption>
          </figure>
        ) : (
          <div className="min-w-0 rounded-[1.5rem] border border-[var(--public-line)] bg-white p-6 sm:p-9">
            <FiClock
              aria-hidden="true"
              className="size-7 text-[var(--public-accent)]"
            />
            <h2 className="public-display mt-5 text-3xl leading-tight sm:text-4xl">
              Midweek homecell prayers.
            </h2>
            <p className="mt-5 text-lg font-semibold">
              {homecellGathering.day}s · {homecellGathering.time}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--public-muted)]">
              {homecellGathering.note} Confirm the current venue and program
              with the church team before visiting.
            </p>
            <p className="mt-4 text-xs leading-6 text-[var(--public-muted)]">
              All times are local to Malawi.
            </p>
            <Link href="/plan-visit" className="public-text-link mt-4">
              New here? Plan your Sunday visit{" "}
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
      <section
        id="group-directory"
        aria-label={ministries ? "Ministry directory" : "Homecell directory"}
        className="public-container scroll-mt-36 pb-14 sm:pb-20"
      >
        <form
          action={groupPaths[kind]}
          method="GET"
          role="search"
          aria-label={ministries ? "Find a ministry" : "Find a homecell"}
          className="grid items-end gap-4 rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6"
        >
          <div className="min-w-0">
            <label
              htmlFor={`group-search-${kind}`}
              className="mb-2 block text-sm font-semibold"
            >
              {ministries
                ? "Search by name or purpose"
                : "Search by name or area"}
            </label>
            <input
              id={`group-search-${kind}`}
              className="public-input"
              type="search"
              name="q"
              maxLength={200}
              defaultValue={filters.q}
              placeholder={
                ministries
                  ? "What would you like to explore?"
                  : "A homecell name or location"
              }
            />
          </div>
          <button type="submit" className="public-button public-button-primary">
            <FiSearch aria-hidden="true" />
            Search {ministries ? "ministries" : "homecells"}
          </button>
        </form>
        {filters.q && (
          <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 text-sm leading-7">
            <p className="min-w-0 wrap-anywhere">
              Results for <strong>{filters.q}</strong>
            </p>
            <Link href={groupPaths[kind]} className="public-text-link">
              Clear search
            </Link>
          </div>
        )}
        <div className="mt-9">
          <Suspense
            key={groupsHref(kind, filters)}
            fallback={<GroupResultsLoading kind={kind} />}
          >
            <GroupResults kind={kind} filters={filters} />
          </Suspense>
        </div>
      </section>
      <section className="border-t border-[var(--public-line)] bg-[var(--brand-soft)]">
        <div className="public-container flex flex-col items-start justify-between gap-7 py-12 lg:flex-row lg:items-center">
          <div className="min-w-0 max-w-2xl">
            <p className="public-eyebrow">Find your next step</p>
            <h2 className="public-display mt-3 text-3xl leading-tight sm:text-4xl">
              There is room for you here.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              You do not need to have everything figured out. Talk to us about
              your questions, your interests, or visiting for the first time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="public-button public-button-primary"
            >
              Help me get connected <FiArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={ministries ? "/homecells" : "/ministries"}
              className="public-button public-button-secondary"
            >
              {ministries ? "Explore homecells" : "Explore ministries"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
export function GroupResultsLoading({ kind }: { kind: PublicGroupKind }) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-[var(--public-line)] bg-white p-6 text-sm leading-7 text-[var(--public-muted)]"
    >
      Loading {kind === "ministry" ? "ministries" : "homecells"}…
    </div>
  );
}
export async function GroupResults({
  kind,
  filters,
}: {
  kind: PublicGroupKind;
  filters: GroupFilters;
}) {
  const plural = kind === "ministry" ? "ministries" : "homecells";
  let result;
  try {
    const params = {
        page: filters.page,
        limit: PUBLIC_GROUP_PAGE_SIZE,
        search: filters.q,
      },
      options = { signal: AbortSignal.timeout(8000) };
    result = publicGroupPage(
      kind,
      await (kind === "ministry"
        ? getPublicMinistries(params, options)
        : getPublicHomecells(params, options)),
    );
  } catch {
    return (
      <div className="max-w-2xl rounded-2xl border border-[var(--public-line)] bg-white p-6">
        <h2 className="public-display text-3xl">
          The {kind === "ministry" ? "ministry" : "homecell"} directory could
          not load.
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          Try again, or contact the church team for help finding a group.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <form action={groupPaths[kind]} method="GET">
            <input type="hidden" name="page" value={filters.page} />
            {filters.q && <input type="hidden" name="q" value={filters.q} />}
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
    redirect(groupsHref(kind, filters, { page: result.totalPages }));
  if (!result.data.length)
    return (
      <div className="max-w-2xl">
        <h2 className="public-display text-3xl">
          {result.total > 0
            ? "The directory has changed."
            : filters.q
              ? `No ${plural} match that search.`
              : `There are no ${plural} listed yet.`}
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          {filters.q
            ? "Try a different name or word, or clear your search to see the directory."
            : "Please contact the church team to find out about getting involved."}
        </p>
        <Link
          href={filters.q ? groupPaths[kind] : "/contact"}
          className="public-text-link mt-4"
        >
          {filters.q ? `Browse all ${plural}` : "Talk to the church team"}
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  return (
    <>
      <p className="mb-6 text-sm leading-7 text-[var(--public-muted)]">
        {result.total} {result.total === 1 ? kind : plural}
        {filters.q ? " matching your search" : " in the directory"} · Page{" "}
        {filters.page} of {result.totalPages}
      </p>
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {result.data.map((group) => (
          <GroupCard key={group.id} group={group} filters={filters} />
        ))}
      </ul>
      <Pagination
        page={filters.page}
        totalPages={result.totalPages}
        basePath={groupPaths[kind]}
        search={filters.q}
      />
    </>
  );
}
export function GroupCard({
  group,
  filters,
}: {
  group: PublicGroup;
  filters: GroupFilters;
}) {
  const href = groupHref(
    group.kind,
    group.slug,
    groupsHref(group.kind, filters),
  );
  const next =
    group.kind === "homecell" ? upcomingGroupPrograms(group)[0] : null;
  const summary =
    group.kind === "ministry"
      ? prepareMessageBody(group.purpose || group.description || "").text
      : group.location?.trim();
  return (
    <li className="flex min-w-0 flex-col rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-7">
      <p className="public-eyebrow">
        {group.kind === "ministry" ? "Ministry" : "Homecell"}
      </p>
      <h2 className="public-display mt-4 text-2xl leading-snug wrap-anywhere sm:text-3xl">
        <Link href={href} className="hover:text-[var(--public-accent)]">
          {group.name}
        </Link>
      </h2>
      <p className="mt-4 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
        {group.kind === "homecell" && (
          <FiMapPin aria-hidden="true" className="mr-2 inline" />
        )}
        {summary
          ? messageExcerpt(summary)
          : group.kind === "homecell"
            ? "Ask the church team about the meeting place."
            : "Ask the church team about opportunities to take part."}
      </p>
      {next && (
        <div className="mt-5 rounded-xl bg-[var(--brand-soft)] p-4">
          <p className="text-xs font-semibold text-[var(--public-muted)]">
            Next planned program
          </p>
          <Link
            href={"/programs/" + encodeURIComponent(next.slug)}
            className="public-text-link mt-1 max-w-full wrap-anywhere"
          >
            {next.type?.name || "Homecell program"}
            <FiArrowUpRight aria-hidden="true" className="shrink-0" />
          </Link>
          <p className="mt-1 text-xs leading-6 text-[var(--public-muted)]">
            <time dateTime={new Date(next.date).toISOString()}>
              {formatChurchDate(next.date, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </time>
          </p>
        </div>
      )}
      <div className="mt-auto pt-6">
        <Link
          href={href}
          aria-label={`Explore ${group.name}`}
          className="public-text-link w-full justify-between border-t border-[var(--public-line)] pt-5"
        >
          Explore {group.kind === "ministry" ? "ministry" : "homecell"}
          <FiArrowRight aria-hidden="true" className="shrink-0" />
        </Link>
      </div>
    </li>
  );
}
