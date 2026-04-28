import { api } from "@/lib/api/client";
import { Publication } from "../types/publication.types";

// -----------------------------
// PUBLISH
// -----------------------------
export async function publishPublication(
  id: string,
): Promise<{ data: Publication }> {
  const res = await api.patch(`/publications/${id}/publish`);
  return res.data;
}

// -----------------------------
// UNPUBLISH
// -----------------------------
export async function unpublishPublication(
  id: string,
): Promise<{ data: Publication }> {
  const res = await api.patch(`/publications/${id}/unpublish`);
  return res.data;
}
