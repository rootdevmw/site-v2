"use client";

import Link from "next/link";
import { FiShield } from "react-icons/fi";
import { RecordStatus } from "@/components/records/RecordLayout";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { getAccountRoles, getRoleContext } from "@/lib/utils/account-records";
import { formatChurchDate } from "@/lib/utils/church-date";
import { accessInfo, type AccessEntry, type AccessKind } from "@/lib/utils/access-lists";

export function AccessList({ kind, records, actorId, busy = false, onDelete }: { kind: AccessKind; records: AccessEntry[]; actorId?: string; busy?: boolean; onDelete: (id: string) => Promise<unknown> }) {
  return <ul className="directory-list" aria-label={accessInfo[kind].title + " results"}>{records.map((entry) => {
    const href = "/dashboard/" + kind + "/" + encodeURIComponent(entry.id);
    const roles = getAccountRoles(entry.roles);
    const context = getRoleContext(kind === "roles" ? [entry.name] : roles);
    const self = kind === "users" && entry.id === actorId;
    const profileName = [entry.member?.firstName, entry.member?.lastName].filter(Boolean).join(" ") || "Open profile";
    return <li key={entry.id} className="directory-row">
      <div className="directory-identity"><span className="directory-initials" aria-hidden="true">{kind === "roles" ? <FiShield /> : entry.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><h2><Link href={href}>{entry.name}</Link></h2><p className="directory-caption">{kind === "users" ? "Account" : "Role"} #{entry.id}</p>{self && <RecordStatus tone="info">Your account</RecordStatus>}</div></div>
      <dl className="directory-fields">
        {kind === "users" ? <>
          <div><dt>Recorded roles</dt><dd className="access-role-tags">{roles.length ? roles.map((role) => <RecordStatus key={role} tone="neutral">{role}</RecordStatus>) : <RecordStatus tone="warning">No role recorded</RecordStatus>}</dd></div>
          <div><dt>Directory profile</dt><dd>{entry.member ? <Link href={"/dashboard/members/" + encodeURIComponent(entry.member.id)}>{profileName}</Link> : <span className="directory-muted">Not linked</span>}</dd></div>
          <div><dt>Account created</dt><dd>{entry.createdAt ? formatChurchDate(entry.createdAt, { day: "numeric", month: "short", year: "numeric" }) : "Not recorded"}</dd></div>
        </> : <>
          <div><dt>Hierarchy position</dt><dd>{context.rank ? `${context.rank} of ${context.levels}` : "Not configured"}</dd></div>
          <div><dt>Configuration</dt><dd><RecordStatus tone={context.rank ? "info" : "warning"}>{context.rank ? "Configured role" : "Outside hierarchy"}</RecordStatus></dd></div>
          <div><dt>Navigation</dt><dd>{context.rank ? `${context.areas.length} dashboard areas` : "Summary unavailable"}</dd></div>
        </>}
      </dl>
      <div className="directory-row-actions" role="group" aria-label={"Actions for " + entry.name}>
        <Link href={href} className="record-button record-button-secondary" aria-label={"Review " + entry.name}>Review</Link><Link href={href + "/edit"} className="directory-text-link" aria-label={"Edit " + entry.name}>Edit</Link>
        <details className="directory-more"><summary>More actions<span className="sr-only"> for {entry.name}</span></summary><div className="pt-2">
          <Link href={"/dashboard/audit/" + (kind === "users" ? "USER" : "ROLE") + "/" + encodeURIComponent(entry.id)} className="directory-text-link">Record history</Link>
          {self ? <p className="directory-caption">Use another administrator account to delete your account.</p> : <RecordActionDialog secondary actionKey={kind + ":" + entry.id} label="Delete" title={"Delete " + entry.name + " · " + accessInfo[kind].singular + " #" + entry.id + "?"} description={kind === "users" ? "Remove this account from the active user list? Its directory profile is a separate record. Review its access and history before continuing." : "Delete this role definition? Assigned accounts or related records may prevent deletion. Review its hierarchy and history first."} confirmLabel={"Delete " + accessInfo[kind].singular} pendingLabel="Deleting…" successMessage="Deletion confirmed." errorMessage="Deletion could not be confirmed. The list has been refreshed; review it before trying again. Related records may prevent deletion." busy={busy} onConfirm={() => onDelete(entry.id)} />}
        </div></details>
      </div>
    </li>;
  })}</ul>;
}
