import { api } from "@/lib/api/client";
import { ContentType } from "../types/content.types";

export async function createContentType(data: { name: string }) {
  const res = await api.post("/content/types", data);
  return res.data as { data: ContentType };
}
