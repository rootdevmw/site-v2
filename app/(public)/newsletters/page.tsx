import { getPublicNewsletters } from "@/lib/public-api/newsletters";
import { Pagination } from "@/components/public/Pagination";

const PAGE_SIZE = 6;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric" });
}

function formatMonth(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short" });
}

function formatYear(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric" });
}

export default async function PublicNewslettersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const res = await getPublicNewsletters({ page, limit: PAGE_SIZE });
  const newsletters = res.data;
  const total = res.meta?.total ?? 0;
  const totalPages = res.meta?.totalPages ?? Math.ceil(total / PAGE_SIZE);

  return (
    <div className="font-sans">
      {/* ── PAGE HEADER ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-screen-2xl">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <div className="h-px w-6 bg-[#e8c49a]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8c49a]">
                  Newsletters
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                Stay connected with the church
              </h1>
              <p className="mt-1.5 text-sm text-[#e6c79c]">
                Updates, stories, and encouragement from church life at Red
                Cross.
              </p>
            </div>
            {total > 0 && (
              <p className="mt-3 text-xs font-medium text-[#c2a23a] sm:mt-0">
                {total} edition{total !== 1 ? "s" : ""} published
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTERS GRID ──────────────────────────────────── */}
      <section className="bg-[#fdf6ee] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          {newsletters.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {newsletters.map((newsletter, i) => (
                  <a
                    key={newsletter.id}
                    href={newsletter.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8c49a] bg-white transition-all duration-200 hover:border-[#7c3d0f]/20 hover:shadow-lg"
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />

                    <div className="relative flex flex-1 flex-col p-6">
                      <span className="font-serif pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold text-[#4a2008]/[0.04]">
                        {String((page - 1) * PAGE_SIZE + i + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      {/* Date badge */}
                      {newsletter.publishedAt && (
                        <div className="mb-4 inline-flex flex-col items-center self-start rounded-xl border border-[#f0dfc0] bg-[#fdf6ee] px-3 py-2 text-center">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#c2620a]">
                            {formatMonth(newsletter.publishedAt)}
                          </span>
                          <span className="font-serif text-2xl font-bold leading-none text-[#4a2008]">
                            {formatDay(newsletter.publishedAt)}
                          </span>
                          <span className="text-[9px] font-medium text-[#8c6d3f]">
                            {formatYear(newsletter.publishedAt)}
                          </span>
                        </div>
                      )}

                      <h2 className="font-serif flex-1 text-lg font-semibold leading-snug text-[#4a2008] group-hover:text-[#7c3d0f]">
                        {newsletter.title}
                      </h2>

                      {newsletter.description && (
                        <p className="mt-2 text-sm leading-6 text-[#6b4c2a]">
                          {newsletter.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between border-t border-[#faebd7] pt-4">
                        <p className="text-xs text-[#8c6d3f]">
                          {newsletter.publishedAt
                            ? formatDate(newsletter.publishedAt)
                            : "Published"}
                        </p>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#c2620a] transition-transform group-hover:translate-x-1">
                          Open PDF →
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                basePath="/newsletters"
              />
            </>
          ) : (
            <div className="rounded-2xl border border-[#e8c49a] bg-white px-8 py-20 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#faebd7] text-[#c2620a]">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.6}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="font-serif text-xl font-semibold text-[#4a2008]">
                No newsletters yet
              </p>
              <p className="mt-2 text-sm text-[#6b4c2a]">
                Published newsletters will appear here. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#e8c49a] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
              Come as you are
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#4a2008]">
              The best way to stay connected is to be part of the family.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/sermons"
              className="rounded-lg bg-[#c2620a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7c3d0f]"
            >
              Read sermons
            </a>
            <a
              href="/contact"
              className="rounded-lg border border-[#e8c49a] bg-white px-5 py-2.5 text-sm font-semibold text-[#4a2008] transition hover:border-[#7c3d0f]/30 hover:shadow-sm"
            >
              Plan a visit
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
