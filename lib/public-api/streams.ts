import type { Stream } from "@/app/modules/streams/types/stream.types";
import { publicApi } from "./client";

export async function getLiveStream() {
  return publicApi<Stream | null>("/streams/live", { revalidate: 20 });
}

export async function getPublicStreams(params?: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 6),
  });

  return publicApi<Stream[]>(`/streams?${searchParams.toString()}`);
}

export async function getStreamBySlug(slug: string) {
  if (!slug) throw new Error("Stream slug is required");

  return publicApi<Stream | null>(`/streams/${slug}`);
}
