import { api } from "@/lib/api/client";

export const getHomecells = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const res = await api.get("/homecells", { params });
  return res.data;
};
