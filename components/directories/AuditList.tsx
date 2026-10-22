import Link from "next/link";
import { FiActivity } from "react-icons/fi";
import type { AuditEntry } from "@/app/modules/audit/types/audit.types";
import { getAuditEntity } from "@/config/audit-entities";
import { auditTimelineHref } from "@/lib/utils/access-lists";
import { formatAuditLabel, getAuditActor, getAuditDifferences } from "@/lib/utils/audit-records";
import { formatChurchDate } from "@/lib/utils/church-date";

export function AuditList({ entries }: { entries: AuditEntry[] }) {
  return <ol className="directory-list" aria-label="History results, newest first">{entries.map((entry) => {
    const href = auditTimelineHref(entry);
    const actorId = entry.user?.id || entry.userId;
    const actor = getAuditActor(entry);
    const diff = getAuditDifferences(entry.before, entry.after, entry.entity);
    return <li key={entry.id} className="directory-row">
      <div className="directory-identity"><span className="directory-initials" aria-hidden="true"><FiActivity /></span><div className="min-w-0"><h2>{href ? <Link href={href}>{formatAuditLabel(entry.action)}</Link> : formatAuditLabel(entry.action)}</h2><p className="directory-caption">Audit entry #{entry.id}</p></div></div>
      <dl className="directory-fields">
        <div><dt>Recorded by</dt><dd>{actorId ? <Link href={"/dashboard/users/" + encodeURIComponent(actorId)}>{actor}</Link> : actor}</dd></div>
        <div><dt>When · Malawi time</dt><dd><time dateTime={entry.createdAt}>{formatChurchDate(entry.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })} CAT</time></dd></div>
        <div><dt>Record</dt><dd>{getAuditEntity(entry.entity).label}{getAuditEntity(entry.entity).key === "SESSION" ? " · ID protected" : entry.entityId ? " #" + entry.entityId : " · ID not recorded"}</dd></div>
      </dl>
      <div className="directory-row-actions">{href ? <Link href={href} className="record-button record-button-secondary" aria-label={"Timeline for " + getAuditEntity(entry.entity).label + " #" + entry.entityId}>Timeline</Link> : <p className="directory-caption">No record timeline</p>}</div>
      <div className="schedule-context">
        <p className="schedule-context-label">{diff.changed.length ? "Differing snapshot fields" : "Snapshot summary"}</p>
        <p className="directory-caption">{diff.changed.length ? diff.changed.slice(0, 4).map((field) => formatAuditLabel(field.key)).join(" · ") + (diff.changed.length > 4 ? ` · ${diff.changed.length - 4} more` : "") : "No comparable differences recorded."}</p>
        {(entry.protectedFields || diff.protectedFields) && <p className="directory-caption">Credential and session-secret fields are omitted.</p>}
      </div>
    </li>;
  })}</ol>;
}
