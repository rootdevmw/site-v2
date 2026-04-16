import { api } from "@/lib/api/client";

export const getHomecellMembers = async (id: string) => {
  const res = await api.get(`/homecells/${id}/members`);
  return res.data;
};
