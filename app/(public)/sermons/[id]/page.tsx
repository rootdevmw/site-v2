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

function formatScripture(s: any) {
  const book = s.book?.charAt(0).toUpperCase() + s.book?.slice(1).toLowerCase();
  if (!s.verseTo || s.verseTo === -1)
    return `${book} ${s.chapter}:${s.verseFrom}`;
  return `${book} ${s.chapter}:${s.verseFrom}-${s.verseTo}`;
}

export default async function SermonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getPublicContent(id);
  const content = res.data;

  if (!content || content.status !== "Published") notFound();

  return (
    <div className="font-serif bg-[#fdf8f2]">
      {/* ── HERO ─────────────────────────────────────────────── */}
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

        <div className="relative mx-auto max-w-4xl px-6 py-5 sm:px-10 lg:px-8">
          {/* Top row: back link + type label + meta — all on one line */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/sermons"
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8c49a]/70 hover:text-[#e8c49a] transition-colors shrink-0"
            >
              ← All sermons
            </Link>

            <div className="flex items-center gap-3 min-w-0">
              <div className="h-px w-8 bg-[#e8c49a]/20 shrink-0" />
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e8c49a]/50 truncate">
                {content.type?.name || "Message"}
              </span>
              <div className="h-px w-8 bg-[#e8c49a]/20 shrink-0" />
            </div>

            <div className="shrink-0 text-right">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-[#e8c49a]/50">
                By
              </p>
              <p className="font-serif text-sm font-semibold text-white">
                {content.author?.firstName} {content.author?.lastName}
              </p>
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-3 text-center text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
            {content.title}
          </h1>

          {/* Date + tags row */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="font-sans text-xs text-[#e6c79c]/60">
              {formatDate(content.createdAt)}
            </span>
            {content.tags?.length > 0 && (
              <>
                <span className="text-[#e8c49a]/30">·</span>
                {content.tags.map((t: any) => (
                  <span
                    key={t.tag.id}
                    className="font-sans rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#e8c49a]/80"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </>
            )}
          </div>

          {/* Scriptures */}
          {content.scriptures?.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-[#e8c49a]/10 pt-3">
              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e8c49a]/50">
                References
              </span>
              <span className="text-[#e8c49a]/20">·</span>
              {content.scriptures.map((s: any) => (
                <span
                  key={s.id}
                  className="font-sans rounded-md border border-[#e8c49a]/20 bg-white/5 px-2.5 py-0.5 text-xs text-[#fde5c0]/80"
                >
                  {formatScripture(s)}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-12 sm:px-10">
        <div className="rounded-2xl border border-[#e8c49a]/60 bg-white p-8">
          <ContentViewer content={content.body} />
        </div>

        {/* Share */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#e8c49a]/40 bg-white px-5 py-4">
          <p className="font-sans text-sm text-[#6b4c2a]">Share this message</p>
          <ShareButton title={content.title} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-[#2b1405] px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <svg
            className="mx-auto mb-6"
            width="60"
            height="12"
            viewBox="0 0 60 12"
            fill="none"
          >
            <circle cx="6" cy="6" r="2" fill="#e8c49a" fillOpacity="0.35" />
            <line
              x1="12"
              y1="6"
              x2="48"
              y2="6"
              stroke="#e8c49a"
              strokeOpacity="0.25"
              strokeWidth="0.75"
            />
            <circle cx="30" cy="6" r="3" fill="#e8c49a" fillOpacity="0.55" />
            <line
              x1="12"
              y1="6"
              x2="48"
              y2="6"
              stroke="#e8c49a"
              strokeOpacity="0.25"
              strokeWidth="0.75"
            />
            <circle cx="54" cy="6" r="2" fill="#e8c49a" fillOpacity="0.35" />
          </svg>

          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#e8c49a]/60">
            Continue reading
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            More from the church
          </h2>
          <p className="mt-3 font-sans text-sm leading-6 text-[#fde5c0]/60">
            Explore more messages, upcoming events, and ways to get involved.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/sermons"
              className="rounded-lg bg-white px-7 py-3 font-sans text-sm font-semibold text-[#2b1405] hover:bg-[#faebd7] transition-colors"
            >
              All sermons
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-[#e8c49a]/40 px-7 py-3 font-sans text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Visit us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
