import { api } from "@/lib/api/client";

export async function publishContent(
  id: string,
  status: "Published" | "Draft",
) {
  const res = await api.post(`/content/${id}/publish`, { status });
  return res.data;
}
