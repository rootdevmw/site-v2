import { api } from "@/lib/api/client";

export async function assignMinistry(memberId: string, ministryId: string) {
  const res = await api.post(`/members/${memberId}/ministries`, {
    ministryId,
  });
  return res.data;
}
