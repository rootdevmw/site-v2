import { renameCatalogProgramType } from "@/lib/api/type-catalogs";

export const updateProgramType = async (id: string, data: { name: string }) => {
  return renameCatalogProgramType(id, data);
};
