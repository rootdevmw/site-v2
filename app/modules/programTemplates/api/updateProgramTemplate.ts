import { api } from "@/lib/api/client";

export async function updateProgramTemplate({
  id,
  data,
}: {
  id: string;
  data: any;
}) {
  const res = await api.patch(`/program-templates/${id}`, data);
  return res.data;
}
