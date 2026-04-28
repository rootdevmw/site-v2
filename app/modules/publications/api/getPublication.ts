import { api } from "@/lib/api/client";
import { Publication } from "../types/publication.types";

export async function getPublication(
  id: string,
): Promise<{ data: Publication }> {
  const res = await api.get(`/publications/${id}`);
  return res.data;
}
