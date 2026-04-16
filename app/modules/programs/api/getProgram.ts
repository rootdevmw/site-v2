import { api } from "@/lib/api/client";

export const getProgram = async (id: string) => {
  const res = await api.get(`/programs/${id}`);
  return res.data;
};
