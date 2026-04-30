import type { Stream } from "@/app/modules/streams/types/stream.types";
import { getStreamBySlug } from "@/lib/public-api/streams";
import { notFound } from "next/navigation";
import { JSX } from "react";

/* ── HELPERS ─────────────────────────────────────────────── */

function getEmbedUrl(url: string, platform?: string) {
  if (!url) return null;

  if (
    platform === "YouTube" ||
    url.includes("youtube.com") ||
    url.includes("youtu.be")
  ) {
    const match =
      url.match(/v=([^&]+)/) ||
      url.match(/youtu\.be\/([^?]+)/) ||
      url.match(/live\/([^?]+)/);

    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1`;
    }
  }

  if (platform === "Facebook" || url.includes("facebook.com")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      url,
    )}&autoplay=true`;
  }

  return url;
}

function formatFull(value?: string | null) {
  if (!value) return "To be announced";

  return new Date(value).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ── PLATFORM CONFIG (same as your live page) ───────────────── */

type PlatformStyle = {
  icon: JSX.Element;
  bg: string;
};

const PLATFORMS: Record<string, PlatformStyle> = {
  YouTube: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    bg: "#DC2626",
  },
  Facebook: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    bg: "#1877F2",
  },
};

const fallbackPlatform: PlatformStyle = {
  icon: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
    </svg>
  ),
  bg: "#c2620a",
};

/* ── PAGE ────────────────────────────────────────────────── */

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function StreamPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) notFound();

  const res = await getStreamBySlug(slug);
  const stream: Stream | null = res.data;

  if (!stream) notFound();

  const now = new Date();

  const startsAt = stream.startsAt ? new Date(stream.startsAt) : null;
  const endsAt = stream.endsAt ? new Date(stream.endsAt) : null;

  const isLive =
    stream.isLive ||
    (startsAt && startsAt <= now && (!endsAt || endsAt >= now));

  const primaryPlatform = stream.platforms?.[0];

  const embedUrl =
    primaryPlatform?.url &&
    getEmbedUrl(primaryPlatform.url, primaryPlatform.name);

  return (
    <div className="font-sans">
      {/* HEADER */}
      <section className="bg-[#2b1405] px-4 py-10">
        <div className="mx-auto max-w-screen-2xl">
          <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
            {stream.title}
          </h1>
          <p className="mt-1.5 text-sm text-[#e6c79c]">
            {formatFull(stream.startsAt)}
          </p>
        </div>
      </section>

      {/* MAIN (MATCHES LIVE PAGE STRUCTURE) */}
      <section className="bg-[#fdf6ee] px-4 py-10">
        <div className="mx-auto max-w-screen-2xl">
          {embedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-[#e8c49a] bg-white shadow-lg">
              {/* TOP BAR */}
              {isLive && (
                <div className="flex items-center gap-3 border-b border-[#e8c49a] bg-[#fdf4f4] px-6 py-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                    Live now
                  </p>
                </div>
              )}

              <div className="grid lg:grid-cols-[1fr_0.7fr]">
                {/* VIDEO (LEFT) */}
                <div className="aspect-video bg-black">
                  <iframe
                    src={embedUrl}
                    className="h-full w-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>

                {/* DETAILS (RIGHT) */}
                <div className="flex flex-col justify-center p-8">
                  <h2 className="font-serif text-2xl font-semibold text-[#4a2008]">
                    {stream.title}
                  </h2>

                  <p className="mt-3 text-sm text-[#6b4c2a]">
                    Join this stream and worship together with the church
                    family.
                  </p>

                  <div className="mt-7 flex flex-col gap-3">
                    {stream.platforms.map((p) => {
                      const style = PLATFORMS[p.name] ?? fallbackPlatform;

                      return (
                        <a
                          key={p.id}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ backgroundColor: style.bg }}
                          className="group flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                            {style.icon}
                          </span>
                          Watch on {p.name}
                          <span className="ml-auto group-hover:translate-x-1 transition">
                            →
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-10 text-center">
              No stream available
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
