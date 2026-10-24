"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { InlineLoader } from "@/components/ui/InlineLoader";
import { useSaveCatalogType } from "@/lib/hooks/useTypeCatalog";
import { getRecordFailure } from "@/lib/utils/record-details";
import { catalogNameError, catalogWriteError, typeCatalogInfo, type CatalogType, type TypeCatalogKind } from "@/lib/utils/type-catalogs";

export type CatalogTypeFormProps = { kind: TypeCatalogKind; type?: CatalogType; onSuccess?: (type: CatalogType) => void; onCancel?: () => void; onPendingChange?: (pending: boolean) => void };
export function CatalogTypeForm({ kind, type, onSuccess, onCancel, onPendingChange }: CatalogTypeFormProps) {
  const nameId = useId();
  const [name, setName] = useState(type?.name ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const pending = useRef(false);
  const mutation = useSaveCatalogType(kind, type?.id);
  return <form className="catalog-name-form" aria-label={type ? "Rename program type" : "Create " + typeCatalogInfo[kind].singular} aria-busy={mutation.isPending} onSubmit={async (event) => {
    event.preventDefault();
    if (pending.current) return;
    const invalid = catalogNameError(name);
    setError(invalid);
    setSaved(false);
    if (invalid) return;
    if (type && name.trim() === type.name) { onSuccess?.(type); return; }
    pending.current = true;
    onPendingChange?.(true);
    try {
      const response = await mutation.mutateAsync({ name: name.trim() });
      setSaved(true);
      if (!type) setName("");
      onSuccess?.(response.data);
    } catch (failure) { setError(catalogWriteError(failure, type ? "rename" : "create")); }
    finally { pending.current = false; onPendingChange?.(false); }
  }}>
    <label htmlFor={nameId}>Type name</label>
    <input id={nameId} name="name" className="record-input" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} disabled={mutation.isPending} aria-invalid={!!error} aria-describedby={nameId + "-help" + (error ? " " + nameId + "-error" : "")} autoComplete="off" />
    <p id={nameId + "-help"} className="directory-caption">Use a clear name people will recognize. Maximum 100 characters.</p>
    {error && <p id={nameId + "-error"} role="alert" className="catalog-form-error">{error}{getRecordFailure(mutation.error) === "session" && <> <Link href="/login" className="directory-text-link">Sign in</Link></>}</p>}
    {saved && !onSuccess && <p role="status" className="directory-notice">Type saved. The catalog has been refreshed.</p>}
    <div className="catalog-form-actions"><button type="submit" disabled={mutation.isPending} className="record-button record-button-primary">{mutation.isPending ? <InlineLoader message={type ? "Saving…" : "Creating…"} /> : type ? "Save name" : "Create type"}</button>{onCancel && <button type="button" disabled={mutation.isPending} onClick={onCancel} className="record-button record-button-secondary">Cancel</button>}</div>
  </form>;
}
