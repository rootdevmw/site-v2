import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicProgram } from "@/lib/public-api/programs";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function PublicProgramDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getPublicProgram(id);
  const program = res.data;

  if (!program) {
    notFound();
  }

  const items = [...program.items].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="font-sans">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#18342f] px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-screen-2xl">
          <Link
            href="/programs"
            className="text-sm font-semibold text-[#9ecfbf] hover:underline"
          >
            ← Back to programs
          </Link>

          <div className="mt-8 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#9ecfbf]">
              {program.type.name}
            </p>

            <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
              {formatDate(program.date)}
            </h1>

            <p className="mt-6 text-[#c5dcd5]">
              Order of service and activities for this gathering.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROGRAM FLOW ─────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-[#d8e2dc] bg-white p-8">
            <h2 className="font-serif text-2xl text-[#18342f] mb-6">
              Order of Service
            </h2>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-xl border border-[#eef5f1] bg-[#f4f8f5] p-4"
                >
                  {/* Time */}
                  <div className="min-w-[70px] text-sm font-semibold text-[#4a7c6f]">
                    {item.time || "—"}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="font-semibold text-[#18342f]">{item.title}</p>

                    {item.description && (
                      <p className="text-sm text-[#52645d] mt-1">
                        {item.description}
                      </p>
                    )}

                    {item.responsible && (
                      <p className="text-xs text-[#6b8c80] mt-1">
                        {item.responsible.firstName} {item.responsible.lastName}
                      </p>
                    )}
                  </div>

                  {/* Sequence */}
                  <div className="font-serif text-lg text-[#18342f]/30">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bg-[#18342f] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9ecfbf]">
            Join us
          </p>

          <h2 className="mt-3 font-serif text-3xl text-white">
            Be part of the service
          </h2>

          <p className="mt-4 text-[#9ab8b0]">
            We would love to worship together with you in person.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-lg bg-white px-6 py-3 text-[#18342f]"
            >
              Plan a visit
            </Link>

            <Link
              href="/live"
              className="rounded-lg border border-white/20 px-6 py-3 text-white"
            >
              Watch live
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
