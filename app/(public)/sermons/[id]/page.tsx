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
      {/* ── HERO (FULL WIDTH) ─────────────────────────────── */}
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

        {/* 🔥 FULL WIDTH CONTAINER */}
        <div className="relative w-full px-6 py-6 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/sermons"
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8c49a]/70 hover:text-[#e8c49a]"
            >
              ← All sermons
            </Link>

            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-[#e8c49a]/20" />
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#e8c49a]/50">
                {content.type?.name || "Message"}
              </span>
              <div className="h-px w-10 bg-[#e8c49a]/20" />
            </div>

            <div className="text-right">
              <p className="font-sans text-[10px] uppercase text-[#e8c49a]/50">
                By
              </p>
              <p className="text-sm text-white">
                {content.author?.firstName} {content.author?.lastName}
              </p>
            </div>
          </div>

          <h1 className="mt-5 text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {content.title}
          </h1>

          <div className="mt-2 flex flex-wrap justify-center gap-2 text-center">
            <span className="font-sans text-xs text-[#e6c79c]/60">
              {formatDate(content.createdAt)}
            </span>

            {content.tags?.length > 0 && (
              <>
                <span className="text-[#e8c49a]/30">·</span>
                {content.tags.map((t: any) => (
                  <span
                    key={t.tag.id}
                    className="font-sans text-[10px] uppercase tracking-widest text-[#e8c49a]/80"
                  >
                    #{t.tag.name}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── BODY (WIDER LAYOUT) ───────────────────────────── */}
      <section className="w-full px-6 py-14 sm:px-10 lg:px-16">
        {/* 🔥 WIDER GRID CONTAINER */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          {/* MAIN CONTENT */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#e8c49a]/60 bg-white p-8">
              <div className="max-w-3xl mx-auto">
                <ContentViewer content={content.body} />
              </div>
            </div>

            {/* SHARE */}
            <div className="rounded-xl border border-[#e8c49a]/40 bg-white px-5 py-4 flex items-center justify-between">
              <p className="font-sans text-sm text-[#6b4c2a]">
                Share this message
              </p>
              <ShareButton title={content.title} />
            </div>
          </div>

          {/* SIDE PANEL (optional future use) */}
          <aside className="hidden lg:block space-y-4">
            <div className="rounded-xl border border-[#e8c49a]/40 bg-white p-5">
              <p className="text-xs uppercase tracking-widest text-[#c2620a] font-semibold">
                Scripture
              </p>

              <div className="mt-3 space-y-2">
                {content.scriptures?.map((s: any) => (
                  <div
                    key={s.id}
                    className="text-sm text-[#4a2008] bg-[#fdf6ee] px-3 py-2 rounded-md border border-[#e8c49a]/30"
                  >
                    {formatScripture(s)}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="bg-[#2b1405] px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#e8c49a]/60">
            Continue reading
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            More from the church
          </h2>

          <p className="mt-3 text-sm text-[#fde5c0]/60">
            Explore more messages, events, and community life.
          </p>

          <div className="mt-7 flex justify-center gap-3">
            <Link
              href="/sermons"
              className="rounded-lg bg-white px-7 py-3 text-sm font-semibold text-[#2b1405]"
            >
              All sermons
            </Link>

            <Link
              href="/contact"
              className="rounded-lg border border-[#e8c49a]/40 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Visit us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
