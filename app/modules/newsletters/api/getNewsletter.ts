import { api } from "@/lib/api/client";
import { Newsletter } from "../types/newsletter.types";

export async function getNewsletter(id: string): Promise<{ data: Newsletter }> {
  const res = await api.get(`/newsletters/${id}`);
  return res.data;
}
