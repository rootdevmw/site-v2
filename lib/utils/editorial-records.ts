import type { RecordTone } from "@/lib/utils/record-details";

export function getContentState(status: string): { label: string; tone: RecordTone; next: "Published" | "Draft" | null } {
  if (status === "Published") return { label: "Published", tone: "positive", next: "Draft" };
  if (status === "Draft") return { label: "Draft", tone: "warning", next: "Published" };
  return { label: "Unknown status", tone: "neutral", next: null };
}

export function getStreamState(stream: { isLive: boolean; startsAt?: string | null; endsAt?: string | null }, now = Date.now()): { label: string; tone: RecordTone } {
  if (stream.isLive) return { label: "Live now", tone: "positive" };
  const end = stream.endsAt ? Date.parse(stream.endsAt) : NaN;
  const start = stream.startsAt ? Date.parse(stream.startsAt) : NaN;
  if (Number.isFinite(end) && end <= now) return { label: "Ended", tone: "neutral" };
  if (Number.isFinite(start) && start > now) return { label: "Scheduled", tone: "info" };
  return { label: "Not live", tone: "neutral" };
}

/** Accept web destinations only, including the API's local upload paths. */
export function getWebUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed || /[\\\u0000-\u001f\u007f]/.test(trimmed)) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export function getPublicationFile(value?: string | null) {
  const href = getWebUrl(value);
  if (!href) return { href: null, format: "No file", canPreview: false };
  const path = new URL(href, "https://local.invalid").pathname;
  const extension = path.match(/\.([a-z0-9]{1,8})$/i)?.[1]?.toUpperCase();
  return { href, format: extension || "Document", canPreview: extension === "PDF" };
}

/** Use a known player URL, never frame a platform's arbitrary destination. */
export function getYouTubePreview(value: string): string | null {
  const href = getWebUrl(value);
  if (!href || href.startsWith("/")) return null;
  const url = new URL(href);
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.split("/")[1];
  if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (/^\/(live|embed|shorts)\//.test(url.pathname)) id = url.pathname.split("/")[2];
  }
  return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? "https://www.youtube-nocookie.com/embed/" + id : null;
}
