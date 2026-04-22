import Link from "next/link";
import { getPublicPrograms } from "@/lib/public-api/programs";

const PAGE_SIZE = 2;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric" });
}

function formatMonth(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short" });
}

function formatWeekday(value: string) {
  return new Date(value).toLocaleDateString(undefined, { weekday: "short" });
}

export default async function PublicProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const res = await getPublicPrograms({
    page,
    limit: PAGE_SIZE,
    fromDate: today.toISOString(),
  });

  const programs = res.data;
  const total = res.meta?.total ?? 0;
  const totalPages = res.meta?.totalPages ?? Math.ceil(total / PAGE_SIZE);

  return (
    <div className="font-sans">
      {/* ── COMPACT PAGE HEADER ────────────────────────────────── */}
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
                  Programs
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                Services & gatherings
              </h1>
              <p className="mt-1.5 text-sm text-[#9ab8b0]">
                Upcoming order of service — so you know what to expect.
              </p>
            </div>
            {total > 0 && (
              <p className="mt-3 text-xs font-medium text-[#6b9e90] sm:mt-0">
                {total} upcoming program{total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ───────────────────────────────────────────── */}
      <section className="bg-[#f4f8f5] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          {programs.length > 0 ? (
            <>
              <div className="grid gap-5 lg:grid-cols-2">
                {programs.map((program) => {
                  const items = [...program.items].sort(
                    (a, b) => a.sequence - b.sequence,
                  );

                  return (
                    <div
                      key={program.id}
                      className="overflow-hidden rounded-2xl border border-[#d8e2dc] bg-white shadow-sm"
                    >
                      {/* ── Card header ── */}
                      <div className="flex items-center gap-4 bg-[#18342f] px-5 py-4">
                        <div className="flex shrink-0 flex-col items-center rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-center">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#9ecfbf]">
                            {formatMonth(program.date)}
                          </span>
                          <span className="font-serif text-2xl font-bold leading-none text-white">
                            {formatDay(program.date)}
                          </span>
                          <span className="mt-0.5 text-[9px] font-medium text-[#9ab8b0]">
                            {formatWeekday(program.date)}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#9ecfbf]">
                            {program.type.name}
                          </span>
                        </div>

                        <Link
                          href={`/programs/${program.id}`}
                          className="shrink-0 rounded-lg border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                          Full view →
                        </Link>
                      </div>

                      {/* ── Timeline items ── */}
                      <div className="divide-y divide-[#f0f5f2]">
                        {items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3.5 px-5 py-3"
                          >
                            <div className="flex shrink-0 flex-col items-center">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eef5f1] text-[10px] font-bold text-[#4a7c6f]">
                                {index + 1}
                              </div>
                              {index < items.length - 1 && (
                                <div className="mt-1 h-3 w-px bg-[#d8e2dc]" />
                              )}
                            </div>

                            <div className="w-14 shrink-0 pt-0.5">
                              <span className="font-mono text-[11px] text-[#4a7c6f]">
                                {item.time || "—"}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1 pt-0.5">
                              <p className="text-sm font-semibold leading-snug text-[#18342f]">
                                {item.title}
                              </p>
                              {item.description && (
                                <p className="mt-0.5 text-xs leading-5 text-[#6b8c80]">
                                  {item.description}
                                </p>
                              )}
                              {item.responsible && (
                                <div className="mt-1.5 inline-flex items-center gap-1.5">
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#eef5f1] text-[8px] font-bold text-[#4a7c6f]">
                                    {item.responsible.firstName?.[0]}
                                    {item.responsible.lastName?.[0]}
                                  </div>
                                  <span className="text-[11px] text-[#6b8c80]">
                                    {item.responsible.firstName}{" "}
                                    {item.responsible.lastName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ── Card footer ── */}
                      <div className="flex items-center justify-between border-t border-[#eef5f1] bg-[#fafcfb] px-5 py-2.5">
                        <p className="text-[11px] text-[#9ab8b0]">
                          {items.length} item{items.length !== 1 ? "s" : ""}
                        </p>
                        <Link
                          href={`/programs/${program.id}`}
                          className="text-[11px] font-semibold text-[#4a7c6f] hover:underline"
                        >
                          View full program →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/programs?page=${page - 1}`}
                      className="rounded-lg border border-[#d8e2dc] bg-white px-4 py-2 text-sm font-medium text-[#18342f] transition hover:border-[#18342f]/30 hover:shadow-sm"
                    >
                      ← Previous
                    </Link>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <Link
                          key={p}
                          href={`/programs?page=${p}`}
                          className={[
                            "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition",
                            p === page
                              ? "bg-[#18342f] text-white"
                              : "border border-[#d8e2dc] bg-white text-[#52645d] hover:border-[#18342f]/30",
                          ].join(" ")}
                        >
                          {p}
                        </Link>
                      ),
                    )}
                  </div>

                  {page < totalPages && (
                    <Link
                      href={`/programs?page=${page + 1}`}
                      className="rounded-lg border border-[#d8e2dc] bg-white px-4 py-2 text-sm font-medium text-[#18342f] transition hover:border-[#18342f]/30 hover:shadow-sm"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="font-serif text-xl font-semibold text-[#18342f]">
                No upcoming programs
              </p>
              <p className="mt-2 text-sm text-[#52645d]">
                Service programs will appear here once scheduled.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── CLOSING CTA ────────────────────────────────────────── */}
      <section className="border-t border-[#d8e2dc] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a7c6f]">
              Join us in person
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#18342f]">
              Every service is a chance to worship together.
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
              href="/events"
              className="rounded-lg border border-[#c5d8d0] bg-white px-5 py-2.5 text-sm font-semibold text-[#18342f] transition hover:border-[#18342f]/30 hover:shadow-sm"
            >
              View all events
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
