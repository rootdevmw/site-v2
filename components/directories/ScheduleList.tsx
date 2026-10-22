"use client";

import Link from "next/link";
import { FiList } from "react-icons/fi";
import type { ReactNode } from "react";
import { RecordStatus } from "@/components/records/RecordLayout";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getEventPhase } from "@/lib/utils/record-details";
import { getProgramDayState } from "@/lib/utils/program-records";
import { scheduleInfo, type ScheduleEntry, type ScheduleKind } from "@/lib/utils/schedule-lists";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children}</dd></div>;
}

function Moment({ value }: { value?: string }) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return <span className="directory-muted">Time to confirm</span>;
  return <time dateTime={value}>{formatChurchDate(value, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} CAT</time>;
}

export function ScheduleList({ kind, records, now, onDelete, busy = false }: { kind: ScheduleKind; records: ScheduleEntry[]; now: Date; onDelete: (id: string) => Promise<unknown>; busy?: boolean }) {
  return <ul className="directory-list schedule-list" aria-label={scheduleInfo[kind].title + " results"}>{records.map((entry) => {
    const href = "/dashboard/" + kind + "/" + encodeURIComponent(entry.id);
    const date = kind === "events" ? entry.startTime : entry.date;
    const validDate = date && Number.isFinite(new Date(date).getTime());
    const dateLabel = validDate ? formatChurchDate(date, { day: "numeric", month: "short", year: "numeric" }) : "date to confirm";
    const recordLabel = entry.name + " · " + (kind === "program-templates" ? "" : dateLabel + " · ") + scheduleInfo[kind].singular + " #" + entry.id;
    const remaining = Math.max(0, (entry.summary?.total ?? 0) - (entry.preview?.length ?? 0));
    const state = kind === "events" ? getEventPhase(entry.startTime || "", entry.endTime || "", now.getTime()) : kind === "programs" ? getProgramDayState(entry.date || "", now) : { label: "Reusable template", tone: "info" as const };
    return <li key={entry.id} className="directory-row schedule-row">
      <div className="directory-identity">
        <div className="schedule-date" aria-hidden="true">{kind === "program-templates" ? <FiList /> : validDate ? <><span>{formatChurchDate(date, { month: "short" })}</span><strong>{formatChurchDate(date, { day: "numeric" })}</strong><span>{formatChurchDate(date, { year: "numeric" })}</span></> : <span>Date<br />TBC</span>}</div>
        <div className="min-w-0"><h2><Link href={href} aria-label={recordLabel}>{entry.name}</Link></h2>
          {kind === "programs" ? <p className="directory-caption">{validDate ? <time dateTime={entry.date}>{formatChurchDate(entry.date!, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</time> : "Date to be confirmed"} · #{entry.id}</p> : <p className="directory-caption">{kind === "events" ? (entry.typeName || "Event type not recorded") + " · Event #" + entry.id : "Template #" + entry.id}</p>}
          <div className="mt-2"><RecordStatus tone={state.tone}>{state.label}</RecordStatus></div>
          {kind === "programs" && <p className="directory-caption">{entry.location || "Location to be confirmed"}</p>}
        </div>
      </div>
      <dl className="directory-fields schedule-fields">
        {kind === "events" ? <>
          <Field label="Starts"><Moment value={entry.startTime} /></Field><Field label="Ends"><Moment value={entry.endTime} /></Field><Field label="Location">{entry.location || <span className="directory-muted">Location to be confirmed</span>}</Field>
        </> : <>
          <Field label={kind === "program-templates" ? "Program type" : "Activities"}>{kind === "program-templates" ? entry.typeName || <span className="directory-muted">Not recorded</span> : entry.summary ? String(entry.summary.total) : <span className="directory-muted">Count unavailable</span>}</Field>
          <Field label="Homecell">{entry.homecell ? <Link href={"/dashboard/homecells/" + encodeURIComponent(entry.homecell.id)}>{entry.homecell.name}</Link> : "Church-wide"}</Field>
          <Field label={kind === "program-templates" ? "Activities" : "Planning"}>{entry.summary ? kind === "program-templates" ? String(entry.summary.total) : <>{entry.summary.timed} with a time<br />{entry.summary.unassigned} need a responsible person</> : <span className="directory-muted">{kind === "program-templates" ? "Count unavailable" : "Planning data unavailable"}</span>}</Field>
        </>}
      </dl>
      <div className="directory-row-actions" role="group" aria-label={"Actions for " + recordLabel}>
        <Link href={href} className="record-button record-button-secondary" aria-label={(kind === "program-templates" ? "Preview and use " : "View ") + recordLabel}>{kind === "program-templates" ? "Preview & use" : "View"}</Link>
        <Link href={href + "/edit"} className="directory-text-link" aria-label={"Edit " + recordLabel}>Edit</Link>
        <details className="directory-more"><summary>More actions<span className="sr-only"> for {recordLabel}</span></summary><div className="pt-2"><RecordActionDialog secondary actionKey={kind + ":" + entry.id} label="Delete" title={"Delete " + recordLabel + "?"} description={kind === "program-templates" ? "Remove this reusable template from the list? Programs already created from it keep their own activities." : "Remove this " + scheduleInfo[kind].singular + "? Review its schedule and related records before continuing."} confirmLabel={"Delete " + scheduleInfo[kind].singular} pendingLabel="Deleting…" successMessage="Deletion confirmed." errorMessage="Deletion could not be confirmed. Review the refreshed list before trying again; related records may prevent deletion." busy={busy} onConfirm={() => onDelete(entry.id)} /></div></details>
      </div>
      {kind === "events" && <div className="schedule-context"><p className="schedule-context-label">Connected ministries</p>{entry.ministries?.length ? <ul className="schedule-connections">{entry.ministries.map((ministry) => <li key={ministry.id}><Link href={"/dashboard/ministries/" + encodeURIComponent(ministry.id)}>{ministry.name}</Link></li>)}</ul> : <p className="directory-caption">{entry.ministries ? "No ministry linked" : "Ministry connections unavailable"}</p>}</div>}
      {kind === "program-templates" && <div className="schedule-context"><p className="schedule-context-label">Activity preview</p>{entry.preview?.length ? <><ol className="schedule-preview">{entry.preview.map((title, index) => <li key={index}>{title || "Untitled activity"}</li>)}</ol>{remaining > 0 && <p className="directory-caption">{remaining} more {remaining === 1 ? "activity" : "activities"} in the full preview.</p>}</> : <p className="directory-caption">{entry.preview ? "No activities yet. Edit the template to build its order of service." : "Activity preview unavailable."}</p>}</div>}
    </li>;
  })}</ul>;
}
