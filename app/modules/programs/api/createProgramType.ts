import { createCatalogType } from "@/lib/api/type-catalogs";

export const createProgramType = async (data: { name: string }) => {
  return createCatalogType("programs", data);
};
