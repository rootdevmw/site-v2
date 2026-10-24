import { api } from "@/lib/api/client";
import { catalogNameError, type CatalogType, type TypeCatalogKind } from "@/lib/utils/type-catalogs";

type CatalogResponse = { success?: boolean; data: (CatalogType & { deletedAt?: string | null })[]; meta?: { total?: number } };
function isCatalogType(value: unknown): value is CatalogType {
  return !!value && typeof value === "object" && "id" in value && typeof value.id === "string" && /^[1-9]\d*$/.test(value.id) && "name" in value && typeof value.name === "string";
}
function typeResult(response: { success?: boolean; data: CatalogType }) {
  if (response.success === false || !isCatalogType(response.data)) throw new Error("The type change could not be confirmed.");
  return { data: { id: response.data.id, name: response.data.name } };
}
export async function getTypeCatalog(kind: TypeCatalogKind, signal?: AbortSignal) {
  const { data: response } = await api.get<CatalogResponse>("/" + kind + "/types", { signal, timeout: 15000, silent: true });
  if (response.success === false || !Array.isArray(response.data) || response.data.some((entry) => !isCatalogType(entry)) || (typeof response.meta?.total === "number" && response.meta.total !== response.data.length)) throw new Error("The complete type catalog could not be loaded.");
  const records = response.data.filter((entry) => !entry.deletedAt).map(({ id, name }) => ({ id, name }));
  if (new Set(records.map(({ id }) => id)).size !== records.length) throw new Error("The type catalog returned duplicate identities.");
  return records.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id, undefined, { numeric: true }));
}
export async function createCatalogType(kind: TypeCatalogKind, data: { name: string }) {
  const error = catalogNameError(data.name);
  if (error) throw new Error(error);
  const response = await api.post<{ success?: boolean; data: CatalogType }>("/" + kind + "/types", { name: data.name.trim() }, { timeout: 30000, silent: true });
  return typeResult(response.data);
}
export async function renameCatalogProgramType(id: string, data: { name: string }) {
  const error = catalogNameError(data.name);
  if (error) throw new Error(error);
  const response = await api.patch<{ success?: boolean; data: CatalogType }>("/programs/types/" + encodeURIComponent(id), { name: data.name.trim() }, { timeout: 30000, silent: true });
  return typeResult(response.data);
}
export async function deleteCatalogProgramType(id: string) {
  const response = await api.delete<{ success?: boolean }>("/programs/types/" + encodeURIComponent(id), { timeout: 30000, silent: true });
  if (response.data.success === false) throw new Error("Deletion could not be confirmed.");
  return response.data;
}
