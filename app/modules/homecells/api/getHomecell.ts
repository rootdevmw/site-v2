import { api } from "@/lib/api/client";


export const getHomecell = async (id: string) => {
  const res = await api.get(`/homecells/${id}`);
  return res.data;
};