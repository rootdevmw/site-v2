import { api } from "@/lib/api/client";
import { MinistryFilters } from "../types/ministry.types";

export async function getMinistries(params: MinistryFilters) {
  const res = await api.get("/ministries", { params });
  return res.data;
}
