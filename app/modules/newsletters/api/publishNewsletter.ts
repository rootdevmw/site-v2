import { api } from "@/lib/api/client";
import { Newsletter } from "../types/newsletter.types";

// -----------------------------
// PUBLISH
// -----------------------------
export async function publishNewsletter(
  id: string,
): Promise<{ data: Newsletter }> {
  const res = await api.patch(`/newsletters/${id}/publish`);
  return res.data;
}

// -----------------------------
// UNPUBLISH
// -----------------------------
export async function unpublishNewsletter(
  id: string,
): Promise<{ data: Newsletter }> {
  const res = await api.patch(`/newsletters/${id}/unpublish`);
  return res.data;
}
