import { getWebUrl } from "@/lib/utils/editorial-records";

export type PublicLeader = {
  id: string;
  name: string;
  initials: string;
  imageUrl: string | null;
  bio: string | null;
};

// Biographies come from the rich-text editor. Render their words on public cards,
// without loading another editor or inserting HTML into the page.
function biographyText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const entities: Record<string, string> = {
    amp: "&",
    apos: "'",
    quot: '"',
    lt: "<",
    gt: ">",
    nbsp: " ",
    rsquo: "’",
    lsquo: "‘",
    rdquo: "”",
    ldquo: "“",
    ndash: "–",
    mdash: "—",
    hellip: "…",
  };
  return (
    value
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<br\s*\/?>|<\/(?:p|div|h[1-6]|li|blockquote)>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
        if (!code.startsWith("#"))
          return entities[code.toLowerCase()] ?? entity;
        const point =
          code[1].toLowerCase() === "x"
            ? parseInt(code.slice(2), 16)
            : Number(code.slice(1));
        return point > 0 &&
          point <= 0x10ffff &&
          !(point >= 0xd800 && point <= 0xdfff)
          ? String.fromCodePoint(point)
          : "";
      })
      .replace(/[^\S\n]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() || null
  );
}

/** Project public profiles explicitly; never pass whole member records to a client component. */
export function getPublicLeaders(value: unknown): PublicLeader[] {
  if (!Array.isArray(value)) throw new Error("Invalid leadership response");
  const profiles = new Map<string, PublicLeader>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const id =
      typeof item.id === "string"
        ? item.id.trim()
        : typeof item.id === "number" && Number.isFinite(item.id)
          ? String(item.id)
          : "";
    const name = [item.firstName, item.lastName]
      .filter((part): part is string => typeof part === "string")
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ");
    if (!id || !name || profiles.has(id)) continue;
    const parts = name.split(" ");
    const initials = [
      parts[0],
      ...(parts.length > 1 ? [parts[parts.length - 1]] : []),
    ]
      .map((part) => Array.from(part)[0])
      .join("")
      .toLocaleUpperCase();
    profiles.set(id, {
      id,
      name,
      initials,
      imageUrl: getWebUrl(
        typeof item.imageUrl === "string" ? item.imageUrl : null,
      ),
      bio: biographyText(item.bio?.bio),
    });
  }
  if (value.length && !profiles.size)
    throw new Error("No readable leadership profiles");
  return [...profiles.values()];
}
