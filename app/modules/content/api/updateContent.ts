import { api } from "@/lib/api/client";
import { ContentFormValues } from "../types/content.types";

export async function updateContent(id: string, data: ContentFormValues) {
  const res = await api.patch(`/content/${id}`, data);
  return res.data;
}
