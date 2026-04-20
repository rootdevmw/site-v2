import { api } from "@/lib/api/client";
import { ContentFormValues } from "../types/content.types";

export async function createContent(data: ContentFormValues) {
  const res = await api.post("/content", data);
  return res.data;
}
