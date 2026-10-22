"use client";

import Link from "next/link";
import { FiBookmark } from "react-icons/fi";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { typeCatalogInfo, type CatalogType, type TypeCatalogKind } from "@/lib/utils/type-catalogs";
import { CatalogTypeDialog } from "./CatalogTypeDialog";

export function TypeCatalogList({ kind, records, canViewHistory, busy = false, onSaved, onDelete }: { kind: TypeCatalogKind; records: CatalogType[]; canViewHistory: boolean; busy?: boolean; onSaved: (type: CatalogType) => void; onDelete: (id: string) => Promise<unknown> }) {
  return <ul className="directory-list" aria-label={typeCatalogInfo[kind].title + " results"}>{records.map((entry) => <li key={entry.id} className="directory-row catalog-row">
    <div className="directory-identity"><span className="directory-initials" aria-hidden="true"><FiBookmark /></span><div className="min-w-0"><h2>{entry.name || "Unnamed type"}</h2><p className="directory-caption">Type #{entry.id}</p></div></div>
    <div className="catalog-record-links"><span className="schedule-context-label">Browse related records</span><Link href={"/dashboard/" + kind + "?typeId=" + encodeURIComponent(entry.id)} className="directory-text-link">{kind === "content" ? "Messages" : "Programs"}<span className="sr-only"> with type {entry.name || "#" + entry.id}</span></Link>{kind === "programs" && <Link href={"/dashboard/program-templates?typeId=" + encodeURIComponent(entry.id)} className="directory-text-link">Templates<span className="sr-only"> with type {entry.name || "#" + entry.id}</span></Link>}</div>
    <div className="directory-row-actions" role="group" aria-label={"Actions for type #" + entry.id}>
      {kind === "programs" && <CatalogTypeDialog kind={kind} type={entry} busy={busy} onSaved={onSaved} />}
      {(canViewHistory || kind === "programs") && <details className="directory-more"><summary>More actions<span className="sr-only"> for {entry.name || "type #" + entry.id}</span></summary><div className="pt-2">
        {canViewHistory && <Link href={"/dashboard/audit/" + typeCatalogInfo[kind].entity + "/" + encodeURIComponent(entry.id)} className="directory-text-link">Record history</Link>}
        {kind === "programs" && <RecordActionDialog secondary actionKey={"program-type:" + entry.id} label="Delete unused type" title={"Delete " + (entry.name || "unnamed type") + " · type #" + entry.id + "?"} description="Remove this type from the catalog? Types used by programs or templates must be reassigned before they can be deleted. Programs and templates are kept." confirmLabel="Delete type" pendingLabel="Deleting…" successMessage="Type deleted." errorMessage="Deletion could not be confirmed. A program or template may still use this type. Check the refreshed catalog and related records before trying again." busy={busy} onConfirm={() => onDelete(entry.id)} />}
      </div></details>}
    </div>
  </li>)}</ul>;
}
