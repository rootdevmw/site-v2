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
      <section className="relative overflow-hidden bg-[#18342f] px-4 py-10 sm:px-6 lg:px-8">
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
                <div className="h-px w-6 bg-[#9ecfbf]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ecfbf]">
                  Newsletters
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                Stay connected with the church
              </h1>
              <p className="mt-1.5 text-sm text-[#9ab8b0]">
                Updates, stories, and encouragement from church life at Red
                Cross.
              </p>
            </div>
            {total > 0 && (
              <p className="mt-3 text-xs font-medium text-[#6b9e90] sm:mt-0">
                {total} edition{total !== 1 ? "s" : ""} published
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTERS GRID ──────────────────────────────────── */}
      <section className="bg-[#f4f8f5] px-4 py-10 sm:px-6 lg:px-8">
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
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#d8e2dc] bg-white transition-all duration-200 hover:border-[#18342f]/20 hover:shadow-lg"
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-[#18342f] to-[#4a7c6f]" />

                    <div className="relative flex flex-1 flex-col p-6">
                      <span className="font-serif pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold text-[#18342f]/[0.04]">
                        {String((page - 1) * PAGE_SIZE + i + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      {/* Date badge */}
                      {newsletter.publishedAt && (
                        <div className="mb-4 inline-flex flex-col items-center self-start rounded-xl border border-[#e2ece6] bg-[#f4f8f5] px-3 py-2 text-center">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#4a7c6f]">
                            {formatMonth(newsletter.publishedAt)}
                          </span>
                          <span className="font-serif text-2xl font-bold leading-none text-[#18342f]">
                            {formatDay(newsletter.publishedAt)}
                          </span>
                          <span className="text-[9px] font-medium text-[#6b8c80]">
                            {formatYear(newsletter.publishedAt)}
                          </span>
                        </div>
                      )}

                      <h2 className="font-serif flex-1 text-lg font-semibold leading-snug text-[#18342f] group-hover:text-[#285047]">
                        {newsletter.title}
                      </h2>

                      {newsletter.description && (
                        <p className="mt-2 text-sm leading-6 text-[#52645d]">
                          {newsletter.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between border-t border-[#eef5f1] pt-4">
                        <p className="text-xs text-[#6b8c80]">
                          {newsletter.publishedAt
                            ? formatDate(newsletter.publishedAt)
                            : "Published"}
                        </p>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#4a7c6f] transition-transform group-hover:translate-x-1">
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
            <div className="rounded-2xl border border-[#d8e2dc] bg-white px-8 py-20 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5f1] text-[#4a7c6f]">
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
              <p className="font-serif text-xl font-semibold text-[#18342f]">
                No newsletters yet
              </p>
              <p className="mt-2 text-sm text-[#52645d]">
                Published newsletters will appear here. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#d8e2dc] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
              Come as you are
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#18342f]">
              The best way to stay connected is to be part of the family.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/contact"
              className="rounded-lg bg-[#18342f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#285047]"
            >
              Plan a visit
            </a>
            <a
              href="/sermons"
              className="rounded-lg border border-[#c5d8d0] bg-white px-5 py-2.5 text-sm font-semibold text-[#18342f] transition hover:border-[#18342f]/30 hover:shadow-sm"
            >
              Read sermons
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
