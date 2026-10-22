import Link from "next/link";
import { redirect } from "next/navigation";
import { FiArrowRight, FiSearch, FiX } from "react-icons/fi";
import { getPublishedContent, getContentTypes } from "@/lib/public-api/content";
import { loadHomeFeed } from "@/lib/utils/optional-feed";
import {
  MESSAGE_PAGE_SIZE,
  messagePage,
  messageTypes,
  messagesHref,
  type MessageFilters,
} from "@/lib/utils/public-messages";
import { MessageCard } from "./MessageCard";
import { Pagination } from "./Pagination";

export function MessageListLoading() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-[var(--public-line)] bg-white p-6"
    >
      <p className="text-base font-semibold">Loading messages…</p>
      <p className="mt-2 text-sm leading-7 text-[var(--public-muted)]">
        Finding teaching and reflections from our church.
      </p>
    </div>
  );
}

export async function MessageBrowse({ filters }: { filters: MessageFilters }) {
  const [result, catalog] = await Promise.all([
    (async () => {
      try {
        return {
          ...messagePage(
            await getPublishedContent(
              {
                page: filters.page,
                limit: MESSAGE_PAGE_SIZE,
                search: filters.q,
                typeId: filters.typeId,
                tags: filters.tags,
              },
              { signal: AbortSignal.timeout(8000) },
            ),
          ),
          unavailable: false,
        };
      } catch {
        return { data: [], total: 0, totalPages: 1, unavailable: true };
      }
    })(),
    loadHomeFeed(async (options) => ({
      data: messageTypes(await getContentTypes(options)),
    })),
  ]);
  if (!result.unavailable && filters.page > result.totalPages)
    redirect(messagesHref(filters, { page: result.totalPages }));
  if (!result.data.length && result.total > 0) result.unavailable = true;
  const types = catalog.data ?? [],
    selectedType = types.find((type) => type.id === filters.typeId);
  const filtered = Boolean(filters.q || filters.typeId || filters.tags);
  return (
    <>
      <form
        action="/content"
        method="GET"
        role="search"
        aria-label="Find messages"
        className="grid min-w-0 items-end gap-4 rounded-2xl border border-[var(--public-line)] bg-white p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.55fr)_auto]"
      >
        <div className="min-w-0">
          <label
            htmlFor="message-search"
            className="mb-2 block text-sm font-semibold"
          >
            Search messages
          </label>
          <input
            id="message-search"
            type="search"
            name="q"
            defaultValue={filters.q}
            maxLength={200}
            placeholder="A title, word or phrase"
            className="public-input"
          />
        </div>
        <div className="min-w-0">
          <label
            htmlFor="message-type"
            className="mb-2 block text-sm font-semibold"
          >
            Message type
          </label>
          <select
            id="message-type"
            name="typeId"
            defaultValue={filters.typeId}
            className="public-input"
          >
            <option value="">All types</option>
            {filters.typeId && !selectedType && (
              <option value={filters.typeId}>Selected type</option>
            )}
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        {filters.tags && (
          <input type="hidden" name="tags" value={filters.tags} />
        )}
        <button type="submit" className="public-button public-button-primary">
          <FiSearch aria-hidden="true" /> Find messages
        </button>
        {catalog.unavailable && (
          <p className="text-sm leading-7 text-[var(--public-muted)] lg:col-span-3">
            Message types could not load. You can still search or keep your
            selected type.
          </p>
        )}
      </form>
      {filtered && (
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <ul
            aria-label="Active message filters"
            className="flex min-w-0 flex-wrap gap-2"
          >
            {[
              {
                label: `Search: ${filters.q}`,
                active: filters.q,
                remove: { q: "" },
              },
              {
                label: `Type: ${selectedType?.name || filters.typeId}`,
                active: filters.typeId,
                remove: { typeId: "" },
              },
              {
                label: `Topic: ${filters.tags}`,
                active: filters.tags,
                remove: { tags: "" },
              },
            ]
              .filter((item) => item.active)
              .map((item) => (
                <li key={item.label} className="min-w-0 max-w-full">
                  <Link
                    href={messagesHref(filters, { ...item.remove, page: 1 })}
                    className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-[var(--public-line)] bg-white px-3 py-2 text-xs leading-5 wrap-anywhere"
                    aria-label={`Remove ${item.label}`}
                  >
                    <span className="min-w-0 wrap-anywhere">{item.label}</span>
                    <FiX aria-hidden="true" className="shrink-0" />
                  </Link>
                </li>
              ))}
          </ul>
          <Link href="/content" className="public-text-link">
            Clear all filters
          </Link>
        </div>
      )}
      <div className="mt-10 border-t border-[var(--public-line)] pt-8">
        {result.unavailable ? (
          <div className="max-w-2xl">
            <h2 className="public-display text-3xl">
              Messages are temporarily unavailable.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              We could not load the message library. Try again, or join us
              online while you wait.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <form action="/content" method="GET">
                {Object.entries({
                  page: String(filters.page),
                  q: filters.q,
                  typeId: filters.typeId,
                  tags: filters.tags,
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
                href="/live"
                className="public-button public-button-secondary"
              >
                Watch online <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : result.data.length ? (
          <>
            <p className="mb-6 text-sm leading-7 text-[var(--public-muted)]">
              {result.total} message{result.total === 1 ? "" : "s"}
              {filtered ? " matching your filters" : " in the library"}
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              Page {filters.page} of {result.totalPages}
            </p>
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {result.data.map((message) => (
                <MessageCard
                  key={message.id}
                  message={message}
                  filters={filters}
                />
              ))}
            </ul>
            <Pagination
              page={filters.page}
              totalPages={result.totalPages}
              basePath="/content"
              typeId={filters.typeId}
              search={filters.q}
              tags={filters.tags}
            />
          </>
        ) : (
          <div className="max-w-2xl">
            <h2 className="public-display text-3xl">
              {filtered
                ? "No messages match those filters."
                : "More messages are on the way."}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--public-muted)]">
              {filtered
                ? "Try another word, choose a different type, or clear a topic filter."
                : "There are no published messages here yet. You are welcome to join us for worship online or in Blantyre."}
            </p>
            <Link
              href={filtered ? "/content" : "/live"}
              className="public-text-link mt-4"
            >
              {filtered ? "Browse all messages" : "Watch online"}{" "}
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
