import { createCatalogType } from "@/lib/api/type-catalogs";

export async function createContentType(data: { name: string }) {
  return createCatalogType("content", data);
}
