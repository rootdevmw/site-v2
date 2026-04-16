import { api } from "@/lib/api/client";

export const getProgramTypes = async () => {
  const res = await api.get("/programs/types");
  return res.data;
};
