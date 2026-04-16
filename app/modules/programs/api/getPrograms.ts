import { api } from "@/lib/api/client";

export const getPrograms = async (params: {
  page?: number;
  limit?: number;
  date?: string;
  homecellId?: string;
}) => {
  const res = await api.get("/programs", { params });
  return res.data;
};
