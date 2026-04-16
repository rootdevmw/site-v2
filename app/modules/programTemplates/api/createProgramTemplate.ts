import { api } from "@/lib/api/client";

export const createProgramTemplate = async (data: any) => {
  const res = await api.post("/program-templates", data);
  return res.data;
};
