import Link from "next/link";
import { getPublishedContent } from "@/lib/public-api/content";
import { Pagination } from "@/components/public/Pagination";

const PAGE_SIZE = 6;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const res = await getPublishedContent({ page, limit: PAGE_SIZE });
  const sermons = res.data;
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
                  Teaching
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                Messages for the journey
              </h1>
              <p className="mt-1.5 text-sm text-[#9ab8b0]">
                Published teaching, articles, and reflections from the church.
              </p>
            </div>
            {total > 0 && (
              <p className="mt-3 text-xs font-medium text-[#6b9e90] sm:mt-0">
                {total} message{total !== 1 ? "s" : ""} published
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── SERMONS GRID ──────────────────────────────────────── */}
      <section className="bg-[#f4f8f5] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          {sermons.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {sermons.map((sermon, i) => (
                  <Link
                    key={sermon.id}
                    href={`/sermons/${sermon.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#d8e2dc] bg-white transition-all duration-200 hover:border-[#18342f]/20 hover:shadow-lg"
                  >
                    {/* Dark top accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#18342f] to-[#4a7c6f]" />

                    <div className="relative flex flex-1 flex-col p-6">
                      {/* Ghost number */}
                      <span className="font-serif pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold text-[#18342f]/[0.04]">
                        {String((page - 1) * PAGE_SIZE + i + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <span className="inline-flex w-fit items-center rounded-full border border-[#d8e2dc] bg-[#f4f8f5] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#4a7c6f]">
                        {sermon.type?.name || "Message"}
                      </span>

                      <h2 className="font-serif mt-4 flex-1 text-lg font-semibold leading-snug text-[#18342f] group-hover:text-[#285047]">
                        {sermon.title}
                      </h2>

                      <div className="mt-5 flex items-center justify-between border-t border-[#eef5f1] pt-4">
                        <p className="text-xs text-[#6b8c80]">
                          {formatDate(sermon.createdAt)}
                        </p>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#4a7c6f] transition-transform group-hover:translate-x-1">
                          Read →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                basePath="/sermons"
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="font-serif text-xl font-semibold text-[#18342f]">
                No messages yet
              </p>
              <p className="mt-2 text-sm text-[#52645d]">
                Published teaching will appear here. Check back soon.
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
              Join us in person
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#18342f]">
              Reading alone is good. Worshipping together is even better.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-[#18342f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#285047]"
            >
              Plan a visit
            </Link>
            <Link
              href="/live"
              className="rounded-lg border border-[#c5d8d0] bg-white px-5 py-2.5 text-sm font-semibold text-[#18342f] transition hover:border-[#18342f]/30 hover:shadow-sm"
            >
              Watch live
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
