"use client";

import Link from "next/link";
import { useState } from "react";
import { FiClock } from "react-icons/fi";
import type { AuditEntry } from "@/app/modules/audit/types/audit.types";
import { getAuditEntity, getAuditRecordHref } from "@/config/audit-entities";
import { orderAuditEntries } from "@/lib/utils/audit-records";
import { formatChurchDate } from "@/lib/utils/church-date";
import { AuditLog } from "@/app/(dashboard)/dashboard/audit/[entity]/[id]/AuditLog";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordPager } from "./RecordPager";

export function AuditRecordView({ entity, id, entries, canOpenRecord }: { entity: string; id: string; entries: AuditEntry[]; canOpenRecord: boolean }) {
  const [page, setPage] = useState(1);
  const context = getAuditEntity(entity);
  const ordered = orderAuditEntries(entries);
  const totalPages = Math.max(1, Math.ceil(ordered.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visible = ordered.slice((currentPage - 1) * 10, currentPage * 10);
  const recordHref = canOpenRecord ? getAuditRecordHref(entity, id) : null;
  return <RecordPage>
    <RecordHeader backHref={"/dashboard/audit/" + encodeURIComponent(context.key)} backLabel="Back to entity history" eyebrow="Record history" title={context.label + " history"}
      description={"Record " + id + " · " + ordered.length + " recorded " + (ordered.length === 1 ? "entry" : "entries")}
      identity={<div className="record-account-icon"><FiClock aria-hidden="true" /></div>}
      badges={<RecordStatus tone={ordered.length ? "info" : "neutral"}>{ordered.length ? "Newest entries first" : "No recorded entries"}</RecordStatus>}
      actions={recordHref && <Link href={recordHref} className="record-button record-button-secondary">Open related record</Link>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack"><RecordSection title="Change timeline" description="Expand an entry to review its recorded values and request details."><AuditLog entries={visible} /><RecordPager page={currentPage} totalPages={totalPages} onPageChange={setPage} label="Audit timeline pages" /></RecordSection></div>
      <aside className="record-stack record-aside" aria-label="Audit record context">
        <RecordSection title="Record context"><RecordFields><RecordField label="Record type">{context.label}</RecordField><RecordField label="Record ID">{id}</RecordField><RecordField label="Recorded entries">{String(ordered.length)}</RecordField><RecordField label="Latest recorded activity" fallback="No recorded activity">{ordered[0] && formatChurchDate(ordered[0].createdAt, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })}</RecordField></RecordFields></RecordSection>
        <RecordSection title="Reading this history"><p className="record-empty">Times are shown in Malawi time. Each entry contains the values its action recorded.</p><p className="record-empty mt-3">“Not included” means the entry did not include that field. It does not mean the field was deleted.</p><p className="record-empty mt-3">Actor names reflect the current account information when available.</p></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
