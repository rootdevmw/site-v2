import { api } from "@/lib/api/client";

export const getProgramTemplates = async (params?: { homecellId?: string }) => {
  const res = await api.get("/program-templates", { params });
  return res.data;
};
