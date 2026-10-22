"use client";

import Link from "next/link";
import { FiHeart, FiUser } from "react-icons/fi";
import { RecordStatus } from "@/components/records/RecordLayout";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getPhoneHref, getPrayerState, getVisitorState } from "@/lib/utils/record-details";
import type { AttentionQueueEntry, AttentionQueueKind } from "@/lib/utils/attention-queues";

export function AttentionQueueList({ kind, records, canRecord, busy, onRecord }: { kind: AttentionQueueKind; records: AttentionQueueEntry[]; canRecord: boolean; busy: boolean; onRecord: (id: string) => Promise<unknown> }) {
  return <ul className="directory-list" aria-label={kind === "prayers" ? "Prayer request results" : "Visitor follow-up results"}>{records.map((entry) => {
    const prayer = "prayerFor" in entry;
    const href = "/dashboard/attention/" + encodeURIComponent(entry.id) + "/" + (prayer ? "prayers" : "visitors");
    const state = prayer ? getPrayerState(entry.status) : getVisitorState(entry.status);
    const actionable = prayer ? getPrayerState(entry.status).canMarkPrayed : getVisitorState(entry.status).canAcknowledge;
    const name = entry.name?.trim() || "Anonymous";
    const phone = !prayer ? getPhoneHref(entry.phone) : null;
    return <li key={entry.id} className="directory-row attention-queue-row">
      <div className="directory-identity"><span className="directory-initials" aria-hidden="true">{prayer ? <FiHeart /> : <FiUser />}</span><div className="min-w-0"><h2><Link href={href}>{prayer ? entry.prayerFor || "Prayer request" : name}</Link></h2><p className="directory-caption">{prayer ? name + " · Request" : "Visit"} #{entry.id}</p><div className="editorial-tags"><RecordStatus tone={state.tone}>{state.label}</RecordStatus>{prayer && entry.isUrgent && <RecordStatus tone="danger">Urgent</RecordStatus>}{!prayer && entry.hasSpecialNeeds && <RecordStatus tone="info">Support requested</RecordStatus>}</div></div></div>
      <dl className="directory-fields">
        {prayer ? <>
          <div><dt>Received · Malawi time</dt><dd><time dateTime={entry.createdAt}>{formatChurchDate(entry.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })} CAT</time></dd></div>
          <div><dt>Request type</dt><dd>{entry.requestType || "Not recorded"}</dd></div><div><dt>Elder-sharing preference</dt><dd>{entry.shareWithElders ? "Sharing requested" : "Sharing not requested"}</dd></div>
        </> : <>
          <div><dt>Visit date · Malawi</dt><dd><time dateTime={entry.visitDate}>{formatChurchDate(entry.visitDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</time></dd></div>
          <div><dt>Contact</dt><dd>{phone ? <a href={phone}>{entry.phone}</a> : entry.phone}{entry.email && <a href={"mailto:" + encodeURIComponent(entry.email)} className="queue-email">{entry.email}</a>}{!entry.phone && !entry.email && <span className="directory-muted">Not provided</span>}</dd></div>
          <div><dt>Visit party</dt><dd>{entry.groupSize || "Not recorded"}{entry.language && <span className="block">{entry.language}</span>}</dd></div>
        </>}
      </dl>
      <div className="directory-row-actions" role="group" aria-label={"Actions for " + (prayer ? "request" : "visit") + " #" + entry.id}><Link href={href} className="record-button record-button-secondary">{prayer ? "Read request" : "View visit"}</Link>
        {canRecord && actionable && <RecordActionDialog secondary actionKey={kind + ":" + entry.id + ":" + entry.status} label={prayer ? "Mark as prayed" : "Acknowledge"} title={prayer ? `Record prayer for request #${entry.id}?` : `Acknowledge visit #${entry.id}?`} description={prayer ? `Confirm prayer for ${name.slice(0, 120)}. Read the full request before recording follow-up.` : `Confirm that ${name.slice(0, 120)}’s visit has been acknowledged. This records a welcome; it does not mark the visit as completed.`} confirmLabel={prayer ? "Mark as prayed" : "Acknowledge visit"} pendingLabel="Recording follow-up…" successMessage="Follow-up status confirmed." errorMessage="The action could not be confirmed. Review the refreshed queue and record before trying again. A linked directory profile is required to record follow-up." busy={busy} onConfirm={() => onRecord(entry.id)} />}
      </div>
      {prayer && <div className="schedule-context"><p className="schedule-context-label">Request preview</p><p className="queue-request-preview">{entry.requestPreview || "No request text provided."}{entry.hasMoreRequest && "…"}</p>{entry.hasMoreRequest && <Link href={href} className="directory-text-link">Read the full request</Link>}</div>}
    </li>;
  })}</ul>;
}
