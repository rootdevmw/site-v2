import { api } from "@/lib/api/client";

export const createProgram = async (data: any) => {
  const res = await api.post("/programs", data);
  return res.data;
};