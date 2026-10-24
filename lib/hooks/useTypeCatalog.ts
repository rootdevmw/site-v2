"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCatalogType, getTypeCatalog, renameCatalogProgramType } from "@/lib/api/type-catalogs";
import { retryRecordRequest } from "@/lib/utils/record-details";
import type { TypeCatalogKind } from "@/lib/utils/type-catalogs";
import { refreshTypeCatalog } from "@/lib/utils/type-catalog-cache";

export function useTypeCatalog(kind: TypeCatalogKind, enabled: boolean) {
  return useQuery({ queryKey: [kind === "content" ? "content-types" : "program-types", "management-catalog"], queryFn: ({ signal }) => getTypeCatalog(kind, signal), enabled, staleTime: 30000, retry: retryRecordRequest });
}

export function useSaveCatalogType(kind: TypeCatalogKind, id?: string) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (data: { name: string }) => id && kind === "programs" ? renameCatalogProgramType(id, data) : createCatalogType(kind, data), retry: false, onSettled: () => refreshTypeCatalog(client, kind) });
}
