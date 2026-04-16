import { api } from "@/lib/api/client";

import { HomecellFormValues } from "../types/homecell.types";

export const updateHomecell = async ({
  id,
  data,
}: {
  id: string;
  data: HomecellFormValues;
}) => {
  const res = await api.patch(`/homecells/${id}`, data);
  return res.data;
};
