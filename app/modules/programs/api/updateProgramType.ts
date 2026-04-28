import { api } from "@/lib/api/client";

export const updateProgramType = async (id: string, data: { name: string }) => {
  const res = await api.patch(`/programs/types/${id}`, data);
  return res.data;
};
