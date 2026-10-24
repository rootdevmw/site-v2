"use client";

import { CatalogTypeForm, type CatalogTypeFormProps } from "@/components/directories/CatalogTypeForm";

export function ProgramTypeForm(props: Omit<CatalogTypeFormProps, "kind" | "type">) {
  return <CatalogTypeForm kind="programs" {...props} />;
}
