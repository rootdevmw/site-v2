import { api } from "@/lib/api/client";
import { ApiResponse } from "@/lib/hooks/usePaginatedQuery";
import { ContentType } from "../types/content.types";

export async function getContentTypes() {
  const res = await api.get("/content/types");
  return res.data as ApiResponse<ContentType>;
}
