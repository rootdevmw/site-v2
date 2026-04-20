import type { Newsletter } from "@/app/modules/newsletters/types/newsletter.types";
import { publicApi } from "./client";

export async function getPublicNewsletters(params?: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 12),
  });

  return publicApi<Newsletter[]>(`/newsletters?${searchParams.toString()}`);
}
