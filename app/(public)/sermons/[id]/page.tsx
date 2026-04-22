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
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-20 sm:px-6 lg:px-8">
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
            className="group mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#e8c49a] transition hover:text-white"
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
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#e8c49a]">
              {content.type?.name || "Message"}
            </span>
          </div>

          <h1 className="font-serif text-3xl font-semibold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
            {content.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#e6c79c]">
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

            <div className="flex items-center gap-2 text-sm text-[#e6c79c]">
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
          <div className="mb-10 flex items-start gap-4 rounded-2xl border border-[#e8c49a] bg-[#fdf6ee] p-6">
            <div className="mt-0.5 h-full w-1 rounded-full bg-[#c2620a]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c2620a]">
                From the church
              </p>
              <p className="mt-1 text-sm leading-7 text-[#6b4c2a]">
                Read, reflect, and share this message with someone this week.
                May it encourage your faith and strengthen your walk.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e8c49a] bg-white p-8 shadow-sm sm:p-10">
            <div
              className="prose prose-stone prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-[#4a2008]
              prose-p:text-[#5c3018] prose-p:leading-8
              prose-a:text-[#c2620a] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-[#4a2008]
              prose-blockquote:border-l-[#c2620a] prose-blockquote:text-[#6b4c2a]"
            >
              <ContentViewer content={content.body} />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e8c49a] bg-white px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c2620a]">
                Found this helpful?
              </p>
              <p className="mt-0.5 text-sm text-[#6b4c2a]">
                Share it with someone who needs encouragement today.
              </p>
            </div>

            <ShareButton title={content.title} />
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="bg-[#2b1405] px-4 py-20 sm:px-6 lg:px-8">
        {/* 🔥 WIDER */}
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c49a]">
            Keep going
          </p>

          <h2 className="font-serif mt-3 text-3xl font-semibold text-white">
            More from the church
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-[#e6c79c]">
            Explore more teaching, or join us in person and be part of the
            community.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/sermons"
              className="rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#2b1405] hover:bg-[#faebd7]"
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
