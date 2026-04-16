import { api } from "@/lib/api/client";

export const removeMember = async ({
  homecellId,
  memberId,
}: {
  homecellId: string;
  memberId: string;
}) => {
  const res = await api.delete(`/homecells/${homecellId}/members/${memberId}`);

  return res.data;
};
