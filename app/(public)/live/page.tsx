import Link from "next/link";
import { getLiveStream, getPublicStreams } from "@/lib/public-api/streams";
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
    if (match?.[1])
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1`;
  }

  if (platform === "Facebook" || url.includes("facebook.com")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true`;
  }

  return url;
}

function formatDay(value?: string | null) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric" });
}

function formatMonth(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, { month: "short" });
}

function formatYear(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, { year: "numeric" });
}

function formatTime(value?: string | null) {
  if (!value) return "Time to be announced";
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ── PLATFORM CONFIG ─────────────────────────────────────── */

type PlatformStyle = {
  icon: JSX.Element;
  bg: string;
  hoverBg: string;
  badgeColor: string;
};

const PLATFORMS: Record<string, PlatformStyle> = {
  YouTube: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    bg: "#DC2626",
    hoverBg: "#B91C1C",
    badgeColor: "#DC2626",
  },
  Facebook: {
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    bg: "#1877F2",
    hoverBg: "#1565D8",
    badgeColor: "#1877F2",
  },
};

const fallbackPlatform: PlatformStyle = {
  icon: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  bg: "#c2620a",
  hoverBg: "#7c3d0f",
  badgeColor: "#c2620a",
};

/* ── PAGE ────────────────────────────────────────────────── */

export default async function LivePage() {
  const [liveRes, streamsRes] = await Promise.all([
    getLiveStream(),
    getPublicStreams({ page: 1, limit: 3 }),
  ]);

  const liveStream = liveRes.data;
  const streams = streamsRes.data;

  const primaryPlatform = liveStream?.platforms?.[0];
  const embedUrl =
    primaryPlatform?.url &&
    getEmbedUrl(primaryPlatform.url, primaryPlatform.name);

  return (
    <div className="font-sans">
      {/* ── PAGE HEADER ───────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2b1405] px-4 py-10 sm:px-6 lg:px-8">
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
                <div className="h-px w-6 bg-[#e8c49a]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8c49a]">
                  Live & online
                </p>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                Worship with us, wherever you are
              </h1>
              <p className="mt-1.5 text-sm text-[#e6c79c]">
                Join the current broadcast or find the next scheduled stream.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE PLAYER ───────────────────────────────────────── */}
      <section className="bg-[#fdf6ee] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          {liveStream && embedUrl ? (
            <div className="overflow-hidden rounded-2xl border border-[#e8c49a] bg-white shadow-lg">
              {/* Live bar */}
              <div className="h-1 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />
              <div className="flex items-center gap-3 border-b border-[#e8c49a] bg-[#fdf4f4] px-6 py-3">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                  Live now
                </p>
              </div>

              <div className="grid lg:grid-cols-[1fr_0.7fr]">
                {/* Embedded player */}
                <div className="aspect-video bg-black">
                  <iframe
                    src={embedUrl}
                    className="h-full w-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  />
                </div>

                {/* Info + platform buttons */}
                <div className="flex flex-col justify-center p-8">
                  <h2 className="font-serif text-2xl font-semibold leading-snug text-[#4a2008]">
                    {liveStream.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#6b4c2a]">
                    We're streaming live right now. Join us from wherever you
                    are and worship together with the Red Cross church family.
                  </p>

                  <div className="mt-7 flex flex-col gap-3">
                    {liveStream.platforms.map((p) => {
                      const style = PLATFORMS[p.name] ?? fallbackPlatform;
                      return (
                        <a
                          key={p.id}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ backgroundColor: style.bg }}
                          className="group flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition hover:shadow-md hover:opacity-90"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
                            {style.icon}
                          </span>
                          Watch on {p.name}
                          <span className="ml-auto opacity-70 transition-transform group-hover:translate-x-1">
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
            /* Off-air state */
            <div className="overflow-hidden rounded-2xl border border-[#e8c49a] bg-white">
              <div className="h-1 w-full bg-gradient-to-r from-[#7c3d0f] to-[#c2a23a]" />
              <div className="flex items-center gap-3 border-b border-[#e8c49a] bg-[#fdf6ee] px-6 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#e8c49a]" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#8c6d3f]">
                  Off air
                </p>
              </div>
              <div className="px-8 py-16 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#faebd7] text-[#c2620a]">
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
                      d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
                    />
                  </svg>
                </div>
                <p className="font-serif text-xl font-semibold text-[#4a2008]">
                  No stream active right now
                </p>
                <p className="mt-2 text-sm text-[#6b4c2a]">
                  Check back on Sunday or see what's coming up below.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── UPCOMING STREAMS ──────────────────────────────────── */}
      <section className="bg-[#2b1405] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c49a]">
              What's next
            </p>
            <h2 className="font-serif mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Upcoming streams
            </h2>
          </div>

          {streams.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {streams.map((stream) => {
                const streamPlatforms = stream.platforms ?? [];
                return (
                  <div
                    key={stream.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
                  >
                    <div className="mb-5 inline-flex flex-col items-center rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#e8c49a]">
                        {formatMonth(stream.startsAt)}
                      </span>
                      <span className="font-serif text-2xl font-bold leading-none text-white">
                        {formatDay(stream.startsAt)}
                      </span>
                      <span className="text-[9px] font-medium text-[#e6c79c]">
                        {formatYear(stream.startsAt)}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold leading-snug text-white">
                      {stream.title}
                    </h3>

                    <div className="mt-3 flex items-center gap-1.5 text-sm text-[#e6c79c]">
                      <svg
                        className="h-3.5 w-3.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatTime(stream.startsAt)}
                    </div>

                    {streamPlatforms.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {streamPlatforms.map((p) => {
                          const style = PLATFORMS[p.name] ?? fallbackPlatform;
                          return (
                            <span
                              key={p.id}
                              style={{ backgroundColor: style.badgeColor }}
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                            >
                              {style.icon}
                              {p.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-14 text-center">
              <p className="text-[#e6c79c]">
                No upcoming streams scheduled yet. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="border-t border-[#e8c49a] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2620a]">
              Need help?
            </p>
            <p className="mt-1 text-[15px] font-medium text-[#4a2008]">
              Trouble joining online? We'll walk you through it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/content"
              className="rounded-lg bg-[#c2620a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7c3d0f]"
            >
              Browse sermons
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-[#e8c49a] bg-white px-5 py-2.5 text-sm font-semibold text-[#4a2008] transition hover:border-[#7c3d0f]/30 hover:shadow-sm"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
