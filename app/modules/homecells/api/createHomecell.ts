import { api } from "@/lib/api/client";

import { HomecellFormValues } from "../types/homecell.types";

export const createHomecell = async (data: HomecellFormValues) => {
  const res = await api.post("/homecells", data);
  return res.data;
};
