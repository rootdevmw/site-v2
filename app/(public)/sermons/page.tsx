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

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; typeId?: string }>;
}) {
  const { page: pageParam, typeId } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [res, typesRes] = await Promise.all([
    getPublishedContent({ page, limit: PAGE_SIZE, typeId }),
    getContentTypes(),
  ]);

  const sermons = res.data;
  const total = res.meta?.total ?? 0;
  const totalPages = res.meta?.totalPages ?? Math.ceil(total / PAGE_SIZE);
  const types = typesRes.data ?? [];

  function buildHref(params: { page?: number; typeId?: string }) {
    const p = new URLSearchParams();
    const resolvedPage = params.page ?? 1;
    const resolvedTypeId =
      params.typeId !== undefined ? params.typeId : (typeId ?? "");
    if (resolvedPage > 1) p.set("page", String(resolvedPage));
    if (resolvedTypeId) p.set("typeId", resolvedTypeId);
    const qs = p.toString();
    return `/sermons${qs ? `?${qs}` : ""}`;
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
                  Teaching
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                Messages for the journey
              </h1>
              <p className="mt-1.5 text-sm text-[#e6c79c]">
                Published teaching, articles, and reflections from the church.
              </p>
            </div>
            {total > 0 && (
              <p className="mt-3 text-xs font-medium text-[#c2a23a] sm:mt-0">
                {total} message{total !== 1 ? "s" : ""} published
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── SERMONS GRID ──────────────────────────────────────── */}
      <section className="bg-[#fdf6ee] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          {/* ── Type filter pills ── */}
          {types.length > 0 && (
            <div className="mb-7 flex flex-wrap gap-2">
              <Link
                href={buildHref({ page: 1, typeId: "" })}
                className={[
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                  !typeId
                    ? "border-[#c2620a] bg-[#c2620a] text-white"
                    : "border-[#e8c49a] bg-white text-[#6b4c2a] hover:border-[#c2620a]/40",
                ].join(" ")}
              >
                All
              </Link>
              {types.map((t) => (
                <Link
                  key={t.id}
                  href={buildHref({ page: 1, typeId: t.id })}
                  className={[
                    "rounded-full border px-4 py-1.5 text-xs font-semibold transition",
                    typeId === t.id
                      ? "border-[#c2620a] bg-[#c2620a] text-white"
                      : "border-[#e8c49a] bg-white text-[#6b4c2a] hover:border-[#c2620a]/40",
                  ].join(" ")}
                >
                  {t.name}
                </Link>
              ))}
            </div>
          )}

          {sermons.length > 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {sermons.map((sermon, i) => (
                  <Link
                    key={sermon.id}
                    href={`/sermons/${sermon.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8c49a] bg-white transition-all duration-200 hover:border-[#7c3d0f]/20 hover:shadow-lg"
                  >
                    {/* Dark top accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />

                    <div className="relative flex flex-1 flex-col p-6">
                      {/* Ghost number */}
                      <span className="font-serif pointer-events-none absolute right-5 top-3 select-none text-6xl font-bold text-[#4a2008]/[0.04]">
                        {String((page - 1) * PAGE_SIZE + i + 1).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      <span className="inline-flex w-fit items-center rounded-full border border-[#e8c49a] bg-[#fdf6ee] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#c2620a]">
                        {sermon.type?.name || "Message"}
                      </span>

                      <h2 className="font-serif mt-4 flex-1 text-lg font-semibold leading-snug text-[#4a2008] group-hover:text-[#7c3d0f]">
                        {sermon.title}
                      </h2>

                      <div className="mt-5 flex items-center justify-between border-t border-[#faebd7] pt-4">
                        <p className="text-xs text-[#8c6d3f]">
                          {formatDate(sermon.createdAt)}
                        </p>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#c2620a] transition-transform group-hover:translate-x-1">
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
                typeId={typeId!}
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="font-serif text-xl font-semibold text-[#4a2008]">
                No messages yet
              </p>
              <p className="mt-2 text-sm text-[#6b4c2a]">
                {typeId
                  ? "No messages found for this type. Try a different filter."
                  : "Published teaching will appear here. Check back soon."}
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
              Join us in person
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#4a2008]">
              Reading alone is good. Worshipping together is even better.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/live"
              className="rounded-lg bg-[#c2620a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7c3d0f]"
            >
              Watch live
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-[#e8c49a] bg-white px-5 py-2.5 text-sm font-semibold text-[#4a2008] transition hover:border-[#7c3d0f]/30 hover:shadow-sm"
            >
              Plan a visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
