import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentViewer } from "@/components/ui/ContentViewer";
import { getPublicContent } from "@/lib/public-api/content";
import { ShareButton } from "@/components/public/ShareButton";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SermonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getPublicContent(id);
  const content = res.data;

  if (!content || content.status !== "Published") {
    notFound();
  }

  return (
    <div className="font-sans">
      {/* ── ARTICLE HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#18342f] px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 opacity-[0.04]">
          <svg viewBox="0 0 200 200" fill="none">
            <rect x="85" y="20" width="30" height="160" fill="white" />
            <rect x="20" y="70" width="160" height="30" fill="white" />
          </svg>
        </div>

        {/* 🔥 WIDER */}
        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/sermons"
            className="group mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#9ecfbf] transition hover:text-white"
          >
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            All sermons
          </Link>

          <div className="mb-5">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#9ecfbf]">
              {content.type?.name || "Message"}
            </span>
          </div>

          <h1 className="font-serif text-3xl font-semibold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
            {content.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#9ab8b0]">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(content.createdAt)}
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 text-sm text-[#9ab8b0]">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              Church of Christ · Red Cross
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT BODY ─────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        {/* 🔥 WIDER */}
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-start gap-4 rounded-2xl border border-[#d8e2dc] bg-[#f4f8f5] p-6">
            <div className="mt-0.5 h-full w-1 rounded-full bg-[#4a7c6f]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4a7c6f]">
                From the church
              </p>
              <p className="mt-1 text-sm leading-7 text-[#52645d]">
                Read, reflect, and share this message with someone this week.
                May it encourage your faith and strengthen your walk.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d8e2dc] bg-white p-8 shadow-sm sm:p-10">
            <div
              className="prose prose-stone prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-[#18342f]
              prose-p:text-[#3a5450] prose-p:leading-8
              prose-a:text-[#4a7c6f] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#18342f]
              prose-blockquote:border-l-[#4a7c6f] prose-blockquote:text-[#52645d]"
            >
              <ContentViewer content={content.body} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d8e2dc] bg-white px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4a7c6f]">
                Found this helpful?
              </p>
              <p className="mt-0.5 text-sm text-[#52645d]">
                Share it with someone who needs encouragement today.
              </p>
            </div>

            <ShareButton title={content.title} />
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="bg-[#18342f] px-4 py-20 sm:px-6 lg:px-8">
        {/* 🔥 WIDER */}
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9ecfbf]">
            Keep going
          </p>

          <h2 className="font-serif mt-3 text-3xl font-semibold text-white">
            More from the church
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-[#9ab8b0]">
            Explore more teaching, or join us in person and be part of the
            community.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/sermons"
              className="rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#18342f] hover:bg-[#edf4ef]"
            >
              All sermons
            </Link>

            <Link
              href="/contact"
              className="rounded-lg border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Plan a visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
