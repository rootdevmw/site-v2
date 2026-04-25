import Link from "next/link";
import { getPublishedContent, getContentTypes } from "@/lib/public-api/content";
import { Pagination } from "@/components/public/Pagination";

const PAGE_SIZE = 6;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface SearchParams {
  page?: string;
  typeId?: string;
  q?: string;
  tags?: string;
}

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { page: pageParam, typeId, q: search, tags } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);

  // Fetch data with all active filters
  const [res, typesRes] = await Promise.all([
    getPublishedContent({
      page,
      limit: PAGE_SIZE,
      typeId,
      search,
      tags,
    }),
    getContentTypes(),
  ]);

  const sermons = res.data || [];
  const total = res.meta?.total ?? 0;
  const totalPages = res.meta?.totalPages ?? 1;
  const types = typesRes.data ?? [];

  /**
   * Helper to build URLs that preserve existing filter state
   */
  function buildHref(updates: Partial<SearchParams>) {
    const p = new URLSearchParams();

    // Determine the new state
    const newPage = updates.page !== undefined ? updates.page : String(page);
    const newTypeId = updates.typeId !== undefined ? updates.typeId : typeId;
    const newSearch = updates.q !== undefined ? updates.q : search;
    const newTags = updates.tags !== undefined ? updates.tags : tags;

    if (Number(newPage) > 1) p.set("page", newPage);
    if (newTypeId) p.set("typeId", newTypeId);
    if (newSearch) p.set("q", newSearch);
    if (newTags) p.set("tags", newTags);

    const qs = p.toString();
    return `/sermons${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="font-sans">
      {/* ── PAGE HEADER ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-screen-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2.5">
                <div className="h-px w-6 bg-[#e8c49a]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8c49a]">
                  Teaching
                </p>
              </div>
              <h1 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
                Messages for the journey
              </h1>
              <p className="mt-2 text-sm text-[#e6c79c]">
                Explore our library of published teachings, articles, and
                spiritual reflections.
              </p>

              {/* SEARCH INPUT */}
              <div className="mt-6 max-w-md">
                <form action="/sermons" method="GET" className="relative group">
                  <input
                    type="text"
                    name="q"
                    defaultValue={search}
                    placeholder="Search titles or keywords..."
                    className="w-full rounded-xl border-none bg-white/10 px-5 py-3 text-sm text-white placeholder-white/40 ring-1 ring-white/20 transition focus:bg-white/15 focus:ring-2 focus:ring-[#e8c49a] outline-none"
                  />
                  {/* Keep the type filter active when searching */}
                  {typeId && (
                    <input type="hidden" name="typeId" value={typeId} />
                  )}
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#e8c49a]"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </div>

            {total > 0 && (
              <p className="text-xs font-medium text-[#c2a23a]">
                {total} message{total !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── SERMONS GRID ──────────────────────────────────────── */}
      <section className="bg-[#fdf6ee] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          {/* Filters Bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ typeId: "", page: "1" })}
                className={`rounded-full border px-5 py-1.5 text-xs font-semibold transition ${
                  !typeId
                    ? "border-[#c2620a] bg-[#c2620a] text-white shadow-md"
                    : "border-[#e8c49a] bg-white text-[#6b4c2a] hover:border-[#c2620a]/40"
                }`}
              >
                All Categories
              </Link>
              {types.map((t) => (
                <Link
                  key={t.id}
                  href={buildHref({ typeId: t.id, page: "1" })}
                  className={`rounded-full border px-5 py-1.5 text-xs font-semibold transition ${
                    typeId === t.id
                      ? "border-[#c2620a] bg-[#c2620a] text-white shadow-md"
                      : "border-[#e8c49a] bg-white text-[#6b4c2a] hover:border-[#c2620a]/40"
                  }`}
                >
                  {t.name}
                </Link>
              ))}
            </div>

            {search && (
              <div className="flex items-center gap-2 text-sm text-[#6b4c2a]">
                <span>
                  Results for "<strong>{search}</strong>"
                </span>
                <Link
                  href={buildHref({ q: "", page: "1" })}
                  className="text-xs font-bold text-[#c2620a] hover:underline"
                >
                  Clear Search
                </Link>
              </div>
            )}
          </div>

          {sermons.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {sermons.map((sermon: any, i: number) => (
                  <Link
                    key={sermon.id}
                    href={`/sermons/${sermon.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8c49a] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />

                    <div className="relative flex flex-1 flex-col p-7">
                      <span className="font-serif pointer-events-none absolute right-6 top-4 select-none text-6xl font-bold text-[#4a2008]/[0.03]">
                        {String((page - 1) * PAGE_SIZE + i + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <span className="inline-flex w-fit items-center rounded-lg bg-[#faebd7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#c2620a]">
                        {sermon.type?.name || "Message"}
                      </span>

                      <h2 className="font-serif mt-5 flex-1 text-xl font-semibold leading-tight text-[#4a2008] group-hover:text-[#7c3d0f]">
                        {sermon.title}
                      </h2>

                      <div className="mt-6 flex items-center justify-between border-t border-[#faebd7] pt-5">
                        <p className="text-xs font-medium text-[#8c6d3f]">
                          {formatDate(sermon.createdAt)}
                        </p>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#c2620a]">
                          READ MESSAGE{" "}
                          <span className="transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-12">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/sermons"
                  // Ensure existing filters are passed to the pagination component
                  typeId={typeId}
                  search={search}
                  tags={tags}
                />
              </div>
            </>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-[#e8c49a] bg-white/50 px-8 py-24 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#faebd7] text-[#c2620a]">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#4a2008]">
                No messages found
              </h3>
              <p className="mt-3 text-[#6b4c2a]">
                {search || typeId
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "We haven't published any messages in this section yet."}
              </p>
              {(search || typeId) && (
                <Link
                  href="/sermons"
                  className="mt-6 inline-block rounded-xl bg-[#c2620a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#7c3d0f]"
                >
                  Clear all filters
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER CTA ────────────────────────────────────────── */}
      <section className="border-t border-[#e8c49a] bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-center text-center gap-8 md:flex-row md:text-left md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c2620a]">
              Join the conversation
            </p>
            <p className="mt-2 text-lg font-medium text-[#4a2008]">
              "Reading alone is good. Worshipping together is even better."
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/live"
              className="min-w-[140px] rounded-xl bg-[#c2620a] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#7c3d0f] hover:shadow-xl"
            >
              Watch Live
            </Link>
            <Link
              href="/contact"
              className="min-w-[140px] rounded-xl border border-[#e8c49a] bg-white px-6 py-3 text-sm font-bold text-[#4a2008] transition hover:border-[#7c3d0f]/30 hover:shadow-md"
            >
              Plan a Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
