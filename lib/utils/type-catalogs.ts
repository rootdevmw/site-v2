import { DIRECTORY_LIMIT } from "./directory-records";

export type TypeCatalogKind = "content" | "programs";
export type CatalogType = { id: string; name: string };
export type CatalogFilters = { search: string; page: number };
export const typeCatalogInfo = {
  content: { title: "Content types", singular: "content type", path: "content-types", role: "MEDIA", entity: "CONTENTTYPE", description: "Organize teaching and resources so the congregation can find the messages they need." },
  programs: { title: "Program types", singular: "program type", path: "program-types", role: "DEACON", entity: "PROGRAMTYPE", description: "Keep service schedules and reusable program templates organized with clear, consistent names." },
} as const;

export function readCatalogFilters(params: Pick<URLSearchParams, "get">): CatalogFilters {
  const page = Number(params.get("page"));
  return { search: params.get("search")?.trim() ?? "", page: Number.isSafeInteger(page) && page > 0 ? page : 1 };
}
export function catalogHref(kind: TypeCatalogKind, filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  return "/dashboard/" + typeCatalogInfo[kind].path + (params.size ? "?" + params : "");
}
export function catalogPage(records: readonly CatalogType[], filters: CatalogFilters) {
  const terms = filters.search.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = records.filter((entry) => terms.every((term) => entry.name.toLocaleLowerCase().includes(term)));
  const start = (filters.page - 1) * DIRECTORY_LIMIT;
  return { data: matches.slice(start, start + DIRECTORY_LIMIT), total: matches.length, limit: DIRECTORY_LIMIT };
}
export function catalogNameError(name: string) {
  return !name.trim() || name.trim().length > 100 ? "Enter a type name from 1 to 100 characters." : "";
}
export function catalogWriteError(error: unknown, operation: "create" | "rename" | "delete") {
  const response = error && typeof error === "object" && "response" in error ? error.response : null;
  const status = response && typeof response === "object" && "status" in response ? response.status : null;
  if (status === 401) return "Your session may have expired. Sign in again before making changes.";
  if (status === 403) return "Your account no longer has permission to make this change.";
  if (status === 404) return "This type is no longer available. Check the refreshed catalog.";
  if (status === 409) return operation === "delete" ? "This type is used by programs or templates. Reassign those records before deleting it." : "A type with this name already exists. Choose another name.";
  return "Could not confirm the change. Check the refreshed catalog before trying again.";
}
