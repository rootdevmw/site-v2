import { api } from "@/lib/api/client";

export async function removeMinistry(memberId: string, ministryId: string) {
  const res = await api.delete(`/members/${memberId}/ministries/${ministryId}`);
  return res.data;
}
