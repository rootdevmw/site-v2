import { api } from "@/lib/api/client";

export async function removeMember(ministryId: string, memberId: string) {
  const res = await api.delete(`/ministries/${ministryId}/members/${memberId}`);
  return res.data;
}
