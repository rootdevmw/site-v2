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
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-screen-2xl">
          <Link
            href="/programs"
            className="text-sm font-semibold text-[#e8c49a] hover:underline"
          >
            ← Back to programs
          </Link>

          <div className="mt-8 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#e8c49a]">
              {program.type.name}
            </p>

            <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
              {formatDate(program.date)}
            </h1>

            <p className="mt-6 text-[#fde5c0]">
              Order of service and activities for this gathering.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROGRAM FLOW ─────────────────────────────────── */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-[#e8c49a] bg-white p-8">
            <h2 className="font-serif text-2xl text-[#4a2008] mb-6">
              Order of Service
            </h2>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-xl border border-[#faebd7] bg-[#fdf6ee] p-4"
                >
                  {/* Time */}
                  <div className="min-w-[70px] text-sm font-semibold text-[#c2620a]">
                    {item.time || "—"}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="font-semibold text-[#4a2008]">{item.title}</p>

                    {item.description && (
                      <p className="text-sm text-[#6b4c2a] mt-1">
                        {item.description}
                      </p>
                    )}

                    {item.responsible && (
                      <p className="text-xs text-[#8c6d3f] mt-1">
                        {item.responsible.firstName} {item.responsible.lastName}
                      </p>
                    )}
                  </div>

                  {/* Sequence */}
                  <div className="font-serif text-lg text-[#4a2008]/30">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bg-[#2b1405] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#e8c49a]">
            Join us
          </p>

          <h2 className="mt-3 font-serif text-3xl text-white">
            Be part of the service
          </h2>

          <p className="mt-4 text-[#e6c79c]">
            We would love to worship together with you in person.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-lg bg-white px-6 py-3 text-[#2b1405] font-semibold hover:bg-[#faebd7]"
            >
              Plan a visit
            </Link>

            <Link
              href="/live"
              className="rounded-lg border border-white/20 px-6 py-3 text-white hover:bg-white/10"
            >
              Watch live
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
