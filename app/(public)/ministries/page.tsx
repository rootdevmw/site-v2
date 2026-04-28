import Link from "next/link";
import { getPublicMinistries } from "@/lib/public-api/ministries";
import { Pagination } from "@/components/public/Pagination";

const PAGE_SIZE = 9;

export default async function PublicMinistriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const res = await getPublicMinistries({ page, limit: PAGE_SIZE });
  const unosortedMinistries = res.data;
  const ministries = [...unosortedMinistries].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  const total = res.meta?.total ?? 0;
  const totalPages = res.meta?.totalPages ?? Math.ceil(total / PAGE_SIZE);

  function stripHtml(html?: string) {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  }

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
                  Ministries
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                Serve, grow, and belong
              </h1>
              <p className="mt-1.5 text-sm text-[#e6c79c]">
                Find a place where your gifts can encourage the church and bless
                the community.
              </p>
            </div>
            {total > 0 && (
              <p className="mt-3 text-xs font-medium text-[#c2a23a] sm:mt-0">
                {total} ministr{total !== 1 ? "ies" : "y"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── MINISTRIES GRID ───────────────────────────────────── */}
      <section className="bg-[#fdf6ee] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          {ministries.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {ministries.map((ministry, i) => (
                  <Link
                    key={ministry.id}
                    href={`/ministries/${ministry.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8c49a] bg-white transition hover:border-[#7c3d0f]/20 hover:shadow-lg"
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />

                    <div className="relative flex flex-1 flex-col p-6">
                      <span className="font-serif pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold text-[#4a2008]/[0.04]">
                        {String((page - 1) * PAGE_SIZE + i + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#faebd7] text-[#4a2008]">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z"
                          />
                        </svg>
                      </div>

                      <h2 className="font-serif flex-1 text-lg font-semibold text-[#4a2008] group-hover:text-[#7c3d0f]">
                        {ministry.name}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[#6b4c2a] line-clamp-3">
                        {stripHtml(ministry.description) ||
                          "Serving together with purpose and unity."}
                      </p>

                      <div className="mt-5 flex items-center gap-1 border-t border-[#faebd7] pt-4 text-xs font-semibold text-[#c2620a]">
                        Learn more
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                basePath="/ministries"
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
                    d="M17 20h5V4H2v16h5m10 0v-8H7v8m10 0H7"
                  />
                </svg>
              </div>
              <p className="font-serif text-xl font-semibold text-[#4a2008]">
                No ministries yet
              </p>
              <p className="mt-2 text-sm text-[#6b4c2a]">
                Check back soon — new opportunities to serve are added
                regularly.
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
              Get involved
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#4a2008]">
              There is a place for you — whatever your gift or season of life.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/events"
              className="rounded-lg bg-[#c2620a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7c3d0f]"
            >
              See events
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-[#e8c49a] bg-white px-5 py-2.5 text-sm font-semibold text-[#4a2008] transition hover:border-[#7c3d0f]/30 hover:shadow-sm"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
