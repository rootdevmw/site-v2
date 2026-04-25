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
      <section className="relative bg-[#2b1405] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-16 opacity-[0.035]">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            className="h-[200px] w-[200px]"
          >
            <rect x="85" y="10" width="30" height="180" fill="white" />
            <rect x="10" y="65" width="180" height="30" fill="white" />
          </svg>
        </div>

        {/* 🔥 WIDER HERO CONTAINER */}
        <div className="relative mx-auto max-w-6xl px-6 py-8 sm:px-10 lg:px-12">
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8c49a]/70 hover:text-[#e8c49a] transition-colors"
          >
            ← Programs
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e8c49a]/20" />
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e8c49a]/50">
              Order of Service
            </span>
            <div className="h-px flex-1 bg-[#e8c49a]/20" />
          </div>

          <h1 className="mt-4 text-center text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            {formatDate(program.date)}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-center font-sans text-sm leading-7 text-[#fde5c0]/70">
            {program.type.name} · Structured flow of today’s service
          </p>

          <div className="mt-6 flex justify-center">
            <svg width="60" height="12" viewBox="0 0 60 12" fill="none">
              <circle cx="6" cy="6" r="2" fill="#e8c49a" fillOpacity="0.4" />
              <line
                x1="12"
                y1="6"
                x2="48"
                y2="6"
                stroke="#e8c49a"
                strokeOpacity="0.3"
                strokeWidth="0.75"
              />
              <circle cx="30" cy="6" r="3" fill="#e8c49a" fillOpacity="0.6" />
              <line
                x1="12"
                y1="6"
                x2="48"
                y2="6"
                stroke="#e8c49a"
                strokeOpacity="0.3"
                strokeWidth="0.75"
              />
              <circle cx="54" cy="6" r="2" fill="#e8c49a" fillOpacity="0.4" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── PROGRAM FLOW ─────────────────────────────────── */}
      <section className="bg-[#fdf6ee] px-4 py-14 sm:px-6 lg:px-10">
        {/* 🔥 WIDER PAGE CONTAINER */}
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c2620a]">
              Service Flow
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#2b1405]">
              {program.location || "Main Service"}
            </h2>
            <div className="mt-4 flex justify-center">
              <div className="h-px w-24 bg-[#e8c49a]/60" />
            </div>
          </div>

          {/* 🔥 WIDER CARD */}
          <div className="rounded-2xl border border-[#e8c49a] bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="group flex gap-5 rounded-xl border border-[#faebd7] bg-[#fffaf4] p-5 lg:p-6 hover:bg-[#fdf6ee] transition"
                >
                  {/* Time */}
                  <div className="min-w-[90px] text-sm font-semibold text-[#c2620a]">
                    {item.time || "—"}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="font-semibold text-[#4a2008] group-hover:text-[#c2620a] transition">
                      {item.title}
                    </p>

                    {item.description && (
                      <p className="text-sm text-[#6b4c2a] mt-1 leading-6">
                        {item.description}
                      </p>
                    )}

                    {item.responsible && (
                      <p className="text-xs text-[#8c6d3f] mt-1">
                        Led by {item.responsible.firstName}{" "}
                        {item.responsible.lastName}
                      </p>
                    )}
                  </div>

                  {/* Index */}
                  <div className="flex items-start">
                    <span className="font-serif text-sm text-[#4a2008]/40 bg-[#f3e1cf] px-2 py-1 rounded-md">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bg-[#2b1405] px-4 py-16 sm:px-6 lg:px-10">
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
