import type { Content } from "@/app/modules/content/types/content.types";
import type { Publication } from "@/app/modules/publications/types/publication.types";
import type { Platform, Stream } from "@/app/modules/streams/types/stream.types";
import { getPublicationFile, getWebUrl } from "./editorial-records";

export type EditorialKind = "content" | "publications" | "streams";
export const editorialInfo = {
  content: { title: "Content", singular: "message", resultLabel: "messages", description: "Review teaching, sermons, and resources before sharing them with the congregation." },
  publications: { title: "Publications", singular: "publication", resultLabel: "publications", description: "Find drafts and published resources, check their attached files, and prepare them to share." },
  streams: { title: "Streams", singular: "stream", resultLabel: "streams", description: "Review broadcast schedules, connected destinations, and the selected live broadcast." },
} as const;
export type EditorialFilters = { page: number; search: string; status: string; typeId: string; platformId: string; isLive: string };
export function readEditorialFilters(kind: EditorialKind, params: Pick<URLSearchParams, "get">): EditorialFilters {
  const page = Number(params.get("page"));
  const id = (key: string) => /^[1-9]\d*$/.test(params.get(key) ?? "") ? params.get(key)! : "";
  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    search: params.get("search")?.trim() ?? "",
    status: kind !== "streams" && ["Draft", "Published"].includes(params.get("status") ?? "") ? params.get("status")! : "",
    typeId: kind === "content" ? id("typeId") : "",
    platformId: kind === "streams" ? id("platformId") : "",
    isLive: kind === "streams" && ["true", "false"].includes(params.get("isLive") ?? "") ? params.get("isLive")! : "",
  };
}

export function editorialParams(kind: EditorialKind, filters: EditorialFilters, paged = true) {
  const params = new URLSearchParams();
  const keys = kind === "content" ? ["search", "status", "typeId"] as const : kind === "publications" ? ["search", "status"] as const : ["search", "isLive", "platformId"] as const;
  for (const key of keys) if (filters[key]) params.set(key, filters[key]);
  if (paged && filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function editorialHref(kind: EditorialKind, filters: EditorialFilters) {
  const query = editorialParams(kind, filters).toString();
  return "/dashboard/" + kind + (query ? "?" + query : "");
}

export type EditorialEntry = {
  id: string; title: string; slug?: string; status?: string; createdAt?: string | null;
  typeName?: string; author?: { id: string; name: string } | null; tags?: string[]; scriptures?: string[];
  description?: string; publishedAt?: string | null; file?: ReturnType<typeof getPublicationFile>; hasFileValue?: boolean;
  isLive?: boolean; startsAt?: string | null; endsAt?: string | null; platforms?: { id: string; name: string; href: string | null }[];
};
export type EditorialPage = { data: EditorialEntry[]; total: number; limit: number };
type SourcePlatform = Platform & { deletedAt?: string | null };
export type EditorialStream = Omit<Stream, "platforms"> & { platforms?: (SourcePlatform | { platform: SourcePlatform | null } | null)[] };

export function contentListEntry(content: Content): EditorialEntry {
  return {
    id: content.id, title: content.title, slug: content.slug, status: content.status, createdAt: content.createdAt, typeName: content.type?.name,
    author: content.author ? { id: content.author.id, name: [content.author.firstName, content.author.lastName].filter(Boolean).join(" ") || "Assigned author" } : null,
    tags: content.tags ? [...new Set(content.tags.map((tag) => tag.tag?.name).filter((name): name is string => !!name))] : undefined,
    scriptures: content.scriptures?.map((reference) => `${reference.book} ${reference.chapter}:${reference.verseFrom}${reference.verseTo && reference.verseTo > reference.verseFrom ? "–" + reference.verseTo : ""}`),
  };
}

export function publicationListEntry(publication: Publication): EditorialEntry {
  return { id: publication.id, title: publication.title, status: publication.publishedAt ? "Published" : "Draft", publishedAt: publication.publishedAt, createdAt: publication.createdAt, description: publication.description?.trim() || "", file: getPublicationFile(publication.fileUrl), hasFileValue: !!publication.fileUrl?.trim() };
}

export function streamListEntry(stream: EditorialStream): EditorialEntry {
  const platforms = new Map<string, { id: string; name: string; href: string | null }>();
  for (const row of stream.platforms ?? []) {
    const platform = row && ("platform" in row ? row.platform : row);
    if (platform?.id && !platform.deletedAt) platforms.set(platform.id, { id: platform.id, name: platform.name, href: getWebUrl(platform.url) });
  }
  return { id: stream.id, title: stream.title, slug: stream.slug, isLive: stream.isLive, startsAt: stream.startsAt, endsAt: stream.endsAt, createdAt: stream.createdAt, platforms: stream.platforms ? [...platforms.values()] : undefined };
}
