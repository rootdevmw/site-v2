import type { PublicBroadcast } from "@/lib/utils/public-library";
import { publicApi } from "./client";

export async function getLiveStream(options?: RequestInit) {
  return publicApi<PublicBroadcast | null>("/streams/live", options);
}

export async function getPublicStreams(
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    period?: "upcoming" | "past";
  },
  options?: RequestInit,
) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 6),
  });

  if (params?.search) searchParams.set("search", params.search);
  if (params?.period) searchParams.set("period", params.period);
  return publicApi<PublicBroadcast[]>(
    `/streams?${searchParams.toString()}`,
    options,
  );
}

export async function getStreamBySlug(slug: string, options?: RequestInit) {
  if (!slug) throw new Error("Stream slug is required");

  return publicApi<PublicBroadcast | null>(
    `/streams/${encodeURIComponent(slug)}`,
    options,
  );
}
