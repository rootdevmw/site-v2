"use client";

import { CatalogTypeForm, type CatalogTypeFormProps } from "@/components/directories/CatalogTypeForm";

export function ContentTypeForm(props: Omit<CatalogTypeFormProps, "kind" | "type">) {
  return <CatalogTypeForm kind="content" {...props} />;
}
