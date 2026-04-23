import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicHomecell } from "@/lib/public-api/homecells";

export default async function PublicMinistryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getPublicHomecell(id);
  const homecell = res.data;

  if (!homecell) {
    notFound();
  }

  return (
    <div className="font-sans bg-white">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2b1405] via-[#2b1405] to-[#1a0c03] px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-4 top-4 h-40 w-40 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/homecells"
            className="inline-flex items-center text-xs font-medium text-[#e8c49a] hover:text-white transition"
          >
            ← Back to homecells
          </Link>

          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e8c49a]/70">
              Homecell
            </p>

            <h1 className="mt-1.5 font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              {homecell.name}
            </h1>

            <p className="mt-2.5 max-w-xl text-sm leading-6 text-[#fde5c0]/80">
              {homecell.location ??
                "Serving together with purpose and unity in Christ."}
            </p>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-[#fffaf3]">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-[#e8c49a] bg-white p-8 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-[#4a2008]">
              About this Homecell
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#6b4c2a]">
              This homecell provides opportunities to serve, grow spiritually,
              and build meaningful relationships within the church community
              around {homecell.location}.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#fff7ec] border border-[#f1d6b3] p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#c2620a] font-semibold">
                  Leader
                </p>
                <p className="mt-1.5 text-sm font-medium text-[#4a2008]">
                  {homecell.leader?.firstName} {homecell.leader?.lastName}
                </p>
              </div>

              <div className="rounded-xl bg-[#fff7ec] border border-[#f1d6b3] p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#c2620a] font-semibold">
                  Overseer
                </p>
                <p className="mt-1.5 text-sm font-medium text-[#4a2008]">
                  {homecell.overseer?.firstName} {homecell.overseer?.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE SECTION ─────────────────────────────────── */}
      <section className="bg-[#2b1405] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e8c49a]">
              Why join
            </p>
            <h2 className="font-serif mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Grow through homecell prayers
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Spiritual growth",
                detail:
                  "Praying together strengthens your relationship with God and deepens your faith.",
              },
              {
                title: "Unity in prayer",
                detail:
                  "Stand together in faith, lifting one another and growing stronger as a homecell family.",
              },
              {
                title: "Support & encouragement",
                detail:
                  "Share burdens, celebrate victories, and experience God's presence together.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10"
              >
                <h3 className="font-serif text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#e6c79c]/80">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="border-t border-[#e8c49a] bg-[#fdf6ee] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
            Get involved
          </p>

          <h2 className="font-serif mt-3 text-2xl font-semibold text-[#4a2008] sm:text-3xl">
            Ready to join a homecell?
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#6b4c2a]">
            Reach out and we'll help you connect with the right group and take
            your next step in faith and community.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-[#c2620a] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#7c3d0f] transition"
            >
              Contact us
            </Link>

            <Link
              href="/events"
              className="rounded-lg border border-[#e8c49a] bg-white px-6 py-3 text-sm font-semibold text-[#4a2008] hover:bg-[#fff3e3] transition"
            >
              See events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
