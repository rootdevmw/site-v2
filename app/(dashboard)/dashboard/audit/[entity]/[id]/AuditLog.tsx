import Link from "next/link";
import type { AuditEntry } from "@/app/modules/audit/types/audit.types";
import { formatChurchDate } from "@/lib/utils/church-date";
import { formatAuditLabel, formatAuditValue, getAuditActor, getAuditDifferences, type AuditDifference } from "@/lib/utils/audit-records";

function AuditFields({ fields }: { fields: AuditDifference[] }) {
  return <ul className="record-audit-fields">{fields.map((field) => <li key={field.key}>
    <h4>{formatAuditLabel(field.key)}</h4>
    <dl className="record-audit-values">
      <div><dt>Before</dt><dd><pre tabIndex={0} aria-label={formatAuditLabel(field.key) + " before"}>{formatAuditValue(field.before, field.beforeIncluded)}</pre></dd></div>
      <div><dt>After</dt><dd><pre tabIndex={0} aria-label={formatAuditLabel(field.key) + " after"}>{formatAuditValue(field.after, field.afterIncluded)}</pre></dd></div>
    </dl>
  </li>)}</ul>;
}

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) return <p className="record-empty">No history has been recorded for this record. This does not confirm whether the underlying record exists.</p>;
  return <ol className="record-audit-timeline" role="list" aria-label="Recorded changes, newest first">{entries.map((entry, index) => {
    const diff = getAuditDifferences(entry.before, entry.after, entry.entity);
    const actor = getAuditActor(entry);
    const actorId = entry.user?.id || entry.userId;
    return <li key={entry.id}>
      <details className="record-audit-entry" open={index === 0}>
        <summary><span className="min-w-0"><span className="record-audit-action">{formatAuditLabel(entry.action)}</span><span className="record-audit-date">{formatChurchDate(entry.createdAt, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" })} · Malawi time</span><span className="record-audit-preview">{actor} · {diff.changed.length} differing fields</span></span><span className="record-audit-expand" aria-hidden="true">+</span></summary>
        <div className="record-audit-body">
          <p className="record-empty">Recorded by {actorId ? <Link href={"/dashboard/users/" + encodeURIComponent(actorId)} className="record-audit-actor">{actor}</Link> : actor}.</p>
          {entry.description && <p className="record-empty mt-3 whitespace-pre-wrap wrap-anywhere">{entry.description}</p>}
          {(entry.protectedFields || diff.protectedFields) && <p className="record-empty mt-3">Credential and session-secret fields are omitted.</p>}
          {diff.changed.length ? <AuditFields fields={diff.changed} /> : <p className="record-empty mt-4">No comparable field differences were recorded. Review the action and available snapshots.</p>}
          {!!diff.unchanged.length && <details className="record-audit-secondary"><summary>View {diff.unchanged.length} unchanged fields</summary><AuditFields fields={diff.unchanged} /></details>}
          {(entry.ipAddress || entry.userAgent || entry.userId) && <details className="record-audit-secondary"><summary>Request details</summary><dl className="record-fields mt-3"><div className="record-field"><dt>Audit entry ID</dt><dd>{entry.id}</dd></div>{entry.userId && <div className="record-field"><dt>Actor account ID</dt><dd>{entry.userId}</dd></div>}{entry.ipAddress && <div className="record-field"><dt>IP address</dt><dd>{entry.ipAddress}</dd></div>}{entry.userAgent && <div className="record-field"><dt>Browser information</dt><dd>{entry.userAgent}</dd></div>}</dl></details>}
        </div>
      </details>
    </li>;
  })}</ol>;
}
