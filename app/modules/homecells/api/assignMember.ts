import { api } from "@/lib/api/client";

export const assignMember = async ({
  homecellId,
  memberId,
}: {
  homecellId: string;
  memberId: string;
}) => {
  const res = await api.post(`/homecells/${homecellId}/members`, {
    memberId,
  });

  return res.data;
};
