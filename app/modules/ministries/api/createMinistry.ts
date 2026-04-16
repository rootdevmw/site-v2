import { api } from "@/lib/api/client";
import { MinistryFormValues } from "../types/ministry.schema";

export async function createMinistry(data: MinistryFormValues) {
  const res = await api.post("/ministries", data);
  return res.data;
}
