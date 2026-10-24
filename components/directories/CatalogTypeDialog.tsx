"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { CatalogTypeForm } from "./CatalogTypeForm";
import { typeCatalogInfo, type CatalogType, type TypeCatalogKind } from "@/lib/utils/type-catalogs";

export function CatalogTypeDialog({ kind, type, busy = false, onSaved }: { kind: TypeCatalogKind; type?: CatalogType; busy?: boolean; onSaved: (type: CatalogType) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [editingType, setEditingType] = useState<CatalogType | undefined>(undefined);
  const title = type ? "Rename program type" : "Add " + typeCatalogInfo[kind].singular;
  function close() { if (!pending) setOpen(false); }
  return <>
    <button type="button" className={"record-button record-button-" + (type ? "secondary" : "primary")} disabled={busy || pending} onClick={() => { setEditingType(type ? { ...type } : undefined); setOpen(true); }} aria-label={type ? "Rename " + type.name + " · type #" + type.id : title}>{type ? "Rename" : title}</button>
    <Dialog open={open} onClose={close} closeDisabled={pending} title={title} description={editingType ? `Update “${editingType.name}” (type #${editingType.id}). The new label will also appear on programs and templates using this type.` : "Add a reusable category for church records."}>
      {open && <CatalogTypeForm kind={kind} type={editingType} onPendingChange={setPending} onCancel={close} onSuccess={(saved) => { onSaved(saved); setOpen(false); }} />}
    </Dialog>
  </>;
}
