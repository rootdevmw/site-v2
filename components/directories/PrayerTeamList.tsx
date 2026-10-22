"use client";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { RecordStatus } from "@/components/records/RecordLayout";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { formatChurchDate } from "@/lib/utils/church-date";
import { prayerTeamName, type PrayerTeamMember } from "@/lib/utils/prayer-team";

export function PrayerTeamList({ records, canViewAccounts, busy, onRemove }: { records: PrayerTeamMember[]; canViewAccounts: boolean; busy: boolean; onRemove: (id: string) => Promise<unknown> }) {
  return <ul className="directory-list" aria-label="Prayer team members">{records.map((entry) => {
    const name = prayerTeamName(entry);
    const eligible = entry.eligibility === "eligible";
    return <li key={entry.userId} className="directory-row">
      <div className="directory-identity"><span className="directory-initials" aria-hidden="true"><FiHeart /></span><div className="min-w-0"><h2>{name}</h2><p className="directory-caption">Account #{entry.userId}</p><div className="editorial-tags"><RecordStatus tone={eligible ? "positive" : "warning"}>{eligible ? "Eligible for notifications" : "Needs account review"}</RecordStatus></div></div></div>
      <dl className="directory-fields"><div><dt>Email</dt><dd>{entry.email ? <a href={"mailto:" + encodeURIComponent(entry.email)}>{entry.email}</a> : "Not recorded"}</dd></div><div><dt>Directory profile</dt><dd>{entry.member ? <Link href={"/dashboard/members/" + encodeURIComponent(entry.member.id)}>{[entry.member.firstName, entry.member.lastName].filter(Boolean).join(" ") || "Profile #" + entry.member.id}</Link> : "No active linked profile"}</dd></div><div><dt>Joined team · Malawi</dt><dd><time dateTime={entry.createdAt}>{formatChurchDate(entry.createdAt, { day: "numeric", month: "short", year: "numeric" })}</time></dd></div></dl>
      <div className="directory-row-actions" role="group" aria-label={"Actions for account #" + entry.userId}>
        {canViewAccounts && entry.eligibility !== "account-unavailable" && <Link href={"/dashboard/users/" + encodeURIComponent(entry.userId)} className="record-button record-button-secondary">View account</Link>}
        <RecordActionDialog secondary actionKey={"prayer-team:" + entry.userId} label="Remove from team" title={"Remove account #" + entry.userId + " from the prayer team?"} description={`${name.slice(0, 120)} will no longer be included in future prayer-team notifications. Their account, directory profile and roles are kept. Messages already being sent may still arrive.`} confirmLabel="Remove from team" pendingLabel="Removing…" successMessage="Removal confirmed." errorMessage="Removal could not be confirmed. Review the refreshed roster before trying again." busy={busy} onConfirm={() => onRemove(entry.userId)} />
      </div>
      {!eligible && <p className="directory-caption schedule-context">{entry.eligibility === "account-unavailable" ? "This account has been removed." : entry.eligibility === "profile-unavailable" ? "This account has no active linked directory profile." : "This account has no email address."} It is excluded from future notification recipient lookups. Remove the entry or ask an administrator to review the account.</p>}
    </li>;
  })}</ul>;
}
