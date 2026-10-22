import type { QueryClient } from "@tanstack/react-query";
import type { TypeCatalogKind } from "./type-catalogs";

export function refreshTypeCatalog(client: QueryClient, kind: TypeCatalogKind) {
  const families = kind === "content" ? ["content-types", "content"] : ["program-types", "programs", "program", "program-templates", "program-template", "homecell", "homecells"];
  return Promise.all([...families, "audit-logs", "audit-timeline"].map((family) => client.invalidateQueries({ queryKey: [family] })));
}
