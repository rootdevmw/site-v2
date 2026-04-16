import { api } from "@/lib/api/client";

export const createProgramType = async (data: { name: string }) => {
  const res = await api.post("/programs/types", data);
  return res.data;
};
