import { api } from "@/lib/api/client";

export async function getProgramTemplate(id: string) {
  const res = await api.get(`/program-templates/${id}`);
  return res.data;
}
