import Link from "next/link";
import { Suspense } from "react";
import { redirect, notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiFileText,
  FiSearch,
} from "react-icons/fi";
import { getPublicStreams } from "@/lib/public-api/streams";
import { getPublicPublications } from "@/lib/public-api/publications";
import {
  loadLiveBroadcast,
  loadBroadcast,
  loadDocument,
} from "@/lib/public-api/library";
import {
  libraryHref,
  libraryReturnHref,
  libraryPage,
  broadcastLabel,
  type LibraryFilters,
  type PublicDocument,
  type PublicBroadcast,
} from "@/lib/utils/public-library";
import { getPublicationFile } from "@/lib/utils/editorial-records";
import {
  prepareMessageBody,
  messageExcerpt,
} from "@/lib/utils/public-message-body";
import { formatChurchDate } from "@/lib/utils/church-date";
import { ServiceTimes } from "./ServiceTimes";
import { BroadcastPlayer } from "./BroadcastPlayer";
import { ShareButton } from "./ShareButton";
type Kind = "streams" | "publications";
const pathFor = (kind: Kind) =>
  kind === "streams" ? "/live" : "/publications";
function detailHref({
  kind,
  id,
  from,
}: {
  kind: Kind;
  id: string;
  from?: string;
}) {
  return (
    (kind === "streams" ? "/streams/" : "/publications/") +
    encodeURIComponent(id) +
    (from && from !== pathFor(kind) ? "?" + new URLSearchParams({ from }) : "")
  );
}
function LibraryLoading() {
  return (
    <p
      role="status"
      className="rounded-2xl border border-[var(--public-line)] bg-white p-6 text-sm leading-7 text-[var(--public-muted)]"
    >
      Loading church resources…
    </p>
  );
}
export function LibraryListing({
  kind,
  filters,
}: {
  kind: Kind;
  filters: LibraryFilters;
}) {
  const live = kind === "streams",
    path = pathFor(kind);
  return (
    <>
      <header className="public-container grid items-start gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div className="min-w-0">
          <p className="public-eyebrow">
            {live
              ? "Online worship · Stay connected"
              : "Publications · Church life"}
          </p>
          <h1 className="public-display mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.1]">
            {live ? (
              <>
                Worship with us,
                <br />
                wherever you are.
              </>
            ) : (
              <>
                Words to encourage.
                <br />
                Stories to share.
              </>
            )}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--public-muted)]">
            {live
              ? "Join a live broadcast, find a scheduled gathering, or explore earlier broadcasts and messages."
              : "Read updates, teaching and encouragement from the life of our church. Open an edition to read or save its document."}
          </p>
        </div>
        <aside className="min-w-0 rounded-2xl border border-[var(--public-line)] bg-white p-6 sm:p-8">
          <h2 className="public-display mb-5 text-2xl">Join us in person.</h2>
          <ServiceTimes />
          <Link href="/plan-visit" className="public-text-link mt-4">
            Plan your first visit
            <FiArrowRight aria-hidden="true" />
          </Link>
        </aside>
      </header>
      {live && (
        <section
          aria-label="Current broadcast"
          className="public-container pb-12"
        >
          <Suspense fallback={<LibraryLoading />}>
            <CurrentBroadcast />
          </Suspense>
        </section>
      )}
      <section
        className="public-container pb-14 sm:pb-20"
        aria-label={live ? "Broadcast library" : "Publication library"}
      >
        <form
          action={path}
          method="GET"
          role="search"
          aria-label={live ? "Find broadcasts" : "Find publications"}
          className={
            "grid min-w-0 items-end gap-4 rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-6 " +
            (live
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.6fr)_auto]"
              : "sm:grid-cols-[minmax(0,1fr)_auto]")
          }
        >
          <div className="min-w-0">
            <label
              htmlFor="library-search"
              className="mb-2 block text-sm font-semibold"
            >
              {live
                ? "Search broadcast titles"
                : "Search titles and descriptions"}
            </label>
            <input
              id="library-search"
              name="q"
              type="search"
              maxLength={200}
              defaultValue={filters.q}
              className="public-input"
            />
          </div>
          {live && (
            <div className="min-w-0">
              <label
                htmlFor="library-period"
                className="mb-2 block text-sm font-semibold"
              >
                Browse
              </label>
              <select
                id="library-period"
                name="period"
                defaultValue={filters.period}
                className="public-input"
              >
                <option value="upcoming">Live &amp; upcoming</option>
                <option value="past">Past broadcasts</option>
              </select>
            </div>
          )}
          <button type="submit" className="public-button public-button-primary">
            <FiSearch aria-hidden="true" />
            Search
          </button>
        </form>
        {(filters.q || (live && filters.period === "past")) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm leading-7">
            <p className="min-w-0 wrap-anywhere">
              {filters.q ? `Search: ${filters.q}` : "Past broadcasts"}
            </p>
            <Link href={path} className="public-text-link">
              Clear filters
            </Link>
          </div>
        )}
        <div className="mt-9">
          <Suspense
            key={libraryHref(path, filters)}
            fallback={<LibraryLoading />}
          >
            <LibraryResults kind={kind} filters={filters} />
          </Suspense>
        </div>
      </section>
      <section className="border-t border-[var(--public-line)] bg-[var(--brand-soft)]">
        <div className="public-container flex flex-col items-start justify-between gap-7 py-12 lg:flex-row lg:items-center">
          <div className="min-w-0 max-w-xl">
            <p className="public-eyebrow">Grow through the week</p>
            <h2 className="public-display mt-3 text-3xl leading-tight sm:text-4xl">
              Stay close to the church family.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              Read a message, share a prayer request or come and worship with
              us.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/content"
              className="public-button public-button-primary"
            >
              Explore messages
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link
              href="/prayer-request"
              className="public-button public-button-secondary"
            >
              Request prayer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
export async function CurrentBroadcast() {
  const result = await loadLiveBroadcast();
  if (result.state !== "ready")
    return (
      <div className="rounded-2xl border border-[var(--public-line)] bg-white p-6">
        <h2 className="public-display text-3xl">
          Live status is temporarily unavailable.
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          Please try again shortly. You can still browse broadcasts, read a
          message or use our church channels.
        </p>
        <ChannelLinks />
      </div>
    );
  if (!result.data)
    return (
      <div className="rounded-2xl border border-[var(--public-line)] bg-[#f0eeeb] p-6 sm:p-9">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#716b65]">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-stone-400"
          />
          Off air
        </p>
        <h2 className="public-display mt-4 text-3xl leading-tight sm:text-4xl">
          We are not broadcasting right now.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--public-muted)]">
          Check upcoming broadcasts below, explore earlier broadcasts, or read a
          message while you wait.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/live?period=past"
            className="public-button public-button-secondary"
          >
            Past broadcasts
            <FiArrowRight aria-hidden="true" />
          </Link>
          <Link href="/content" className="public-text-link">
            Read a message
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
        <ChannelLinks />
      </div>
    );
  return (
    <div>
      <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-red-800">
        <span aria-hidden="true" className="size-2 rounded-full bg-red-700" />
        Live now
      </p>
      <h2 className="public-display mb-6 text-3xl leading-tight wrap-anywhere sm:text-4xl">
        {result.data.title}
      </h2>
      <BroadcastPlayer key={result.data.id} stream={result.data} />
    </div>
  );
}
import { church } from "@/config/church";
function ChannelLinks() {
  return (
    <div className="mt-5 flex flex-wrap gap-5">
      <a
        href={church.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="public-text-link"
      >
        Our YouTube channel
        <FiArrowUpRight aria-hidden="true" />
        <span className="sr-only"> in a new tab</span>
      </a>
      <a
        href={church.facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="public-text-link"
      >
        Our Facebook page
        <FiArrowUpRight aria-hidden="true" />
        <span className="sr-only"> in a new tab</span>
      </a>
      <a
        href={church.tiktokUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="public-text-link"
      >
        Our TikTok page
        <FiArrowUpRight aria-hidden="true" />
        <span className="sr-only"> in a new tab</span>
      </a>
    </div>
  );
}
export async function LibraryResults({
  kind,
  filters,
}: {
  kind: Kind;
  filters: LibraryFilters;
}) {
  const path = pathFor(kind);
  let result;
  try {
    const params = {
        page: filters.page,
        limit: 6,
        search: filters.q,
        period: filters.period,
      },
      options = { signal: AbortSignal.timeout(8000) };
    result = libraryPage(
      kind,
      await (kind === "streams"
        ? getPublicStreams(params, options)
        : getPublicPublications(params, options)),
    );
  } catch {
    return (
      <div className="max-w-2xl">
        <h2 className="public-display text-3xl">
          {kind === "streams" ? "Broadcasts" : "Publications"} could not load.
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          Please try again or contact the church team for help.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <form action={path} method="GET">
            <input type="hidden" name="page" value={filters.page} />
            <input type="hidden" name="q" value={filters.q} />
            {kind === "streams" && (
              <input type="hidden" name="period" value={filters.period} />
            )}
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
    redirect(libraryHref(path, filters, { page: result.totalPages }));
  if (!result.data.length)
    return (
      <div className="max-w-2xl">
        <h2 className="public-display text-3xl">
          {result.total
            ? "The library has changed."
            : filters.q
              ? "Nothing matches that search."
              : kind === "publications"
                ? "New editions will appear here."
                : filters.period === "past"
                  ? "No earlier broadcasts are listed yet."
                  : "No upcoming broadcasts are listed yet."}
        </h2>
        <p className="mt-4 text-base leading-8 text-[var(--public-muted)]">
          {filters.q
            ? "Try another word or clear the search."
            : "Explore our messages or contact the church team about current resources."}
        </p>
        <Link
          href={
            filters.q
              ? libraryHref(path, filters, { page: 1, q: "" })
              : "/content"
          }
          className="public-text-link mt-4"
        >
          {filters.q ? "Clear search" : "Explore messages"}
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    );
  return (
    <>
      <p className="mb-6 text-sm leading-7 text-[var(--public-muted)]">
        {result.total} {kind === "streams" ? "broadcast" : "publication"}
        {result.total === 1 ? "" : "s"} · Page {filters.page} of{" "}
        {result.totalPages}
      </p>
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {result.data.map((item) => (
          <li
            key={item.id}
            className="flex min-w-0 flex-col rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-7"
          >
            <p className="public-eyebrow">
              {"slug" in item
                ? broadcastLabel(item, result.checkedAt)
                : getPublicationFile(item.fileUrl).format}
            </p>
            <h2 className="public-display mt-4 text-2xl leading-snug wrap-anywhere sm:text-3xl">
              <Link
                href={detailHref({
                  kind,
                  id: "slug" in item ? item.slug : item.id,
                  from: libraryHref(path, filters),
                })}
                className="hover:text-[var(--public-accent)]"
              >
                {item.title}
              </Link>
            </h2>
            <LibraryItemText item={item} />
            <div className="mt-auto pt-6">
              <Link
                href={detailHref({
                  kind,
                  id: "slug" in item ? item.slug : item.id,
                  from: libraryHref(path, filters),
                })}
                aria-label={`Open ${item.title}`}
                className="public-text-link w-full justify-between border-t border-[var(--public-line)] pt-5"
              >
                {kind === "streams" ? "Broadcast details" : "Read this edition"}
                <FiArrowRight aria-hidden="true" className="shrink-0" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {result.totalPages > 1 && (
        <nav
          aria-label="Library pages"
          className="mt-10 flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            {filters.page > 1 && (
              <Link
                href={libraryHref(path, filters, { page: filters.page - 1 })}
                rel="prev"
                className="public-button public-button-secondary"
              >
                Previous
              </Link>
            )}
          </div>
          <p className="order-first w-full text-center text-xs text-[var(--public-muted)] sm:order-none sm:w-auto">
            Page {filters.page} of {result.totalPages}
          </p>
          <div>
            {filters.page < result.totalPages && (
              <Link
                href={libraryHref(path, filters, { page: filters.page + 1 })}
                rel="next"
                className="public-button public-button-secondary"
              >
                Next
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
function LibraryItemText({ item }: { item: PublicBroadcast | PublicDocument }) {
  const date = "slug" in item ? item.startsAt : item.publishedAt;
  return (
    <>
      {date && (
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          <time dateTime={date}>
            {formatChurchDate(date, {
              day: "numeric",
              month: "long",
              year: "numeric",
              ...("slug" in item ? { hour: "numeric", minute: "2-digit" } : {}),
            })}
          </time>
          {"slug" in item ? " CAT" : ""}
        </p>
      )}
      {!("slug" in item) && item.description && (
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)] wrap-anywhere">
          {messageExcerpt(prepareMessageBody(item.description).text, 180)}
        </p>
      )}
      {"slug" in item && !date && (
        <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
          Time to be confirmed.
        </p>
      )}
    </>
  );
}
export async function onlineMetadata(
  kind: Kind,
  address: string,
): Promise<Metadata> {
  const result = await (kind === "streams"
    ? loadBroadcast(address)
    : loadDocument(address));
  if (result.state !== "ready")
    return {
      title: "Resource unavailable",
      robots: { index: false, follow: true },
    };
  return {
    title: result.data.title,
    alternates: {
      canonical: detailHref({
        kind,
        id: "slug" in result.data ? result.data.slug : result.data.id,
      }),
    },
    description:
      kind === "streams"
        ? `Watch ${result.data.title} with Church of Christ at Red Cross.`
        : `Read ${result.data.title}, a publication from Church of Christ at Red Cross.`,
    openGraph: { title: result.data.title, type: "website" },
  };
}
export async function OnlineDetails({
  kind,
  address,
  from: source,
}: {
  kind: Kind;
  address: string;
  from?: unknown;
}) {
  const path = pathFor(kind),
    from = libraryReturnHref(path, source),
    result = await (kind === "streams"
      ? loadBroadcast(address)
      : loadDocument(address));
  if (result.state === "missing") notFound();
  if (result.state !== "ready")
    return (
      <section className="public-container public-section">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" />
          Back to {kind === "streams" ? "broadcasts" : "publications"}
        </Link>
        <h1 className="public-display mt-6 text-4xl leading-tight sm:text-5xl">
          This resource could not load.
        </h1>
        <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
          Please try again or contact the church team.
        </p>
        <form
          action={detailHref({ kind, id: address })}
          method="GET"
          className="mt-6"
        >
          <input type="hidden" name="from" value={from} />
          <button type="submit" className="public-button public-button-primary">
            Try again
          </button>
        </form>
      </section>
    );
  const item = result.data;
  if ("slug" in item && item.slug !== address)
    permanentRedirect(detailHref({ kind, id: item.slug, from }));
  const href = detailHref({ kind, id: "slug" in item ? item.slug : item.id });
  return (
    <>
      <header className="public-container py-10 sm:py-14">
        <Link href={from} className="public-text-link">
          <FiArrowLeft aria-hidden="true" />
          Back to {kind === "streams" ? "broadcasts" : "publications"}
        </Link>
        <div className="mt-7 max-w-4xl min-w-0">
          <p className="public-eyebrow">
            {"slug" in item
              ? broadcastLabel(item, result.checkedAt)
              : "From our church family"}
          </p>
          <h1 className="public-display mt-4 text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] wrap-anywhere">
            {item.title}
          </h1>
          <LibraryItemText item={item} />
          <div className="mt-6">
            <ShareButton title={item.title} path={href} />
          </div>
        </div>
      </header>
      <section className="public-container pb-14 sm:pb-20">
        {"slug" in item ? (
          <>
            <BroadcastPlayer key={item.id} stream={item} />
            <dl className="mt-7 grid gap-6 rounded-2xl border border-[var(--public-line)] bg-white p-6 sm:grid-cols-2">
              {[
                ["Starts", item.startsAt],
                ["Ends", item.endsAt],
              ].map(([label, date]) => (
                <div key={label}>
                  <dt className="text-sm font-semibold">{label}</dt>
                  <dd className="mt-2 text-sm leading-7 text-[var(--public-muted)]">
                    {date ? (
                      <time dateTime={date}>
                        {formatChurchDate(date, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        CAT
                      </time>
                    ) : (
                      "Not recorded"
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              Times are local to Malawi. Earlier broadcasts may be available on
              the provider&apos;s page.
            </p>
          </>
        ) : (
          <DocumentActions item={item} />
        )}
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href={path} className="public-button public-button-secondary">
            {kind === "streams" ? "More broadcasts" : "More publications"}
          </Link>
          <Link href="/contact" className="public-text-link">
            Contact the church
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
function DocumentActions({ item }: { item: PublicDocument }) {
  const file = getPublicationFile(item.fileUrl);
  return (
    <div className="max-w-3xl rounded-2xl border border-[var(--public-line)] bg-white p-6 sm:p-9">
      <FiFileText
        aria-hidden="true"
        className="size-8 text-[var(--public-accent)]"
      />
      <h2 className="public-display mt-5 text-3xl">Read the document.</h2>
      <p className="mt-4 text-base leading-8 text-[var(--public-muted)]">
        {file.href
          ? "Open the document in a new tab. Your browser’s document viewer can save or print a copy."
          : "The document link is unavailable. Please contact the church team for this edition."}
      </p>
      {file.href && (
        <a
          href={file.href}
          data-journey="publication_open"
          target="_blank"
          rel="noopener noreferrer"
          className="public-button public-button-primary mt-6"
        >
          Open {file.format === "PDF" ? "PDF" : "document"}
          <FiArrowUpRight aria-hidden="true" />
          <span className="sr-only"> in a new tab</span>
        </a>
      )}
    </div>
  );
}
export function LibraryNotFound() {
  return (
    <section className="public-container public-section">
      <p className="public-eyebrow">Resource not found</p>
      <h1 className="public-display mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
        Let&apos;s find something else to explore.
      </h1>
      <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
        This resource is not available at this address.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/live" className="public-button public-button-secondary">
          Broadcasts
        </Link>
        <Link
          href="/publications"
          className="public-button public-button-secondary"
        >
          Publications
        </Link>
        <Link href="/contact" className="public-text-link">
          Contact the church
        </Link>
      </div>
    </section>
  );
}
