"use client";

import Link from "next/link";
import { FiBookOpen, FiFileText, FiVideo } from "react-icons/fi";
import type { ReactNode } from "react";
import { RecordStatus } from "@/components/records/RecordLayout";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getContentState, getStreamState } from "@/lib/utils/editorial-records";
import { editorialInfo, type EditorialEntry, type EditorialKind } from "@/lib/utils/editorial-lists";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children}</dd></div>;
}
function RecordedDate({ value, time = false, fallback = "Not recorded" }: { value?: string | null; time?: boolean; fallback?: string }) {
  if (!value) return <span className="directory-muted">{fallback}</span>;
  if (!Number.isFinite(Date.parse(value))) return <span className="directory-muted">Date to confirm</span>;
  return <time dateTime={value}>{formatChurchDate(value, { day: "numeric", month: "short", year: "numeric", ...(time ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}) })}{time ? " CAT" : ""}</time>;
}

export function EditorialList({ kind, records, now, onDelete, busy = false, authorLinkAllowed = false }: { kind: EditorialKind; records: EditorialEntry[]; now: Date; onDelete: (id: string) => Promise<unknown>; busy?: boolean; authorLinkAllowed?: boolean }) {
  const Icon = kind === "content" ? FiBookOpen : kind === "publications" ? FiFileText : FiVideo;
  return <ul className="directory-list editorial-list" aria-label={editorialInfo[kind].title + " results"}>{records.map((entry) => {
    const href = "/dashboard/" + kind + "/" + encodeURIComponent(entry.id);
    const label = entry.title + " · " + editorialInfo[kind].singular + " #" + entry.id;
    const state = kind === "streams" ? entry.isLive ? { label: "Selected live", tone: "positive" as const } : getStreamState({ isLive: false, startsAt: entry.startsAt, endsAt: entry.endsAt }, now.getTime()) : getContentState(entry.status || "");
    const reviewPublish = kind !== "streams" && entry.status === "Draft" && (kind === "content" || !!entry.file?.href);
    return <li key={entry.id} className="directory-row">
      <div className="directory-identity"><span className="directory-initials" aria-hidden="true"><Icon className="size-5" /></span><div className="min-w-0"><h2><Link href={href} aria-label={label}>{entry.title}</Link></h2><p className="directory-caption">{editorialInfo[kind].singular[0].toUpperCase() + editorialInfo[kind].singular.slice(1)} #{entry.id}</p><div className="mt-2"><RecordStatus tone={state.tone}>{state.label}</RecordStatus></div></div></div>
      <dl className="directory-fields">
        {kind === "content" ? <>
          <Field label="Type">{entry.typeName || <span className="directory-muted">Not recorded</span>}</Field>
          <Field label="Author">{entry.author ? authorLinkAllowed && entry.author.id ? <Link href={"/dashboard/members/" + encodeURIComponent(entry.author.id)}>{entry.author.name}</Link> : entry.author.name : <span className="directory-muted">Not assigned</span>}</Field>
          <Field label="Created"><RecordedDate value={entry.createdAt} /></Field>
        </> : kind === "publications" ? <>
          <Field label="Published"><RecordedDate value={entry.publishedAt} time fallback="Not published" /></Field>
          <Field label="Attachment">{entry.file?.href ? <a href={entry.file.href} target="_blank" rel="noopener noreferrer">Open {entry.file.format}<span className="sr-only"> for {entry.title} (new tab)</span></a> : <span className="directory-muted">{entry.hasFileValue ? "File link unavailable" : "No file attached"}</span>}</Field>
          <Field label="Created"><RecordedDate value={entry.createdAt} /></Field>
        </> : <>
          <Field label="Starts"><RecordedDate value={entry.startsAt} time fallback="Not scheduled" /></Field>
          <Field label="Ends"><RecordedDate value={entry.endsAt} time fallback="No end time recorded" /></Field>
          <Field label="Platforms">{entry.platforms ? String(entry.platforms.length) : <span className="directory-muted">Count unavailable</span>}</Field>
        </>}
      </dl>
      <div className="directory-row-actions" role="group" aria-label={"Actions for " + label}>
        <Link href={href} className="record-button record-button-secondary" aria-label={(reviewPublish ? "Review and publish " : "Review ") + label}>{reviewPublish ? "Review & publish" : "Review"}</Link>
        <Link href={href + "/edit"} className="directory-text-link" aria-label={"Edit " + label}>Edit</Link>
        {kind === "content" && entry.status === "Published" && entry.slug && <Link href={"/content/" + encodeURIComponent(entry.slug)} className="directory-text-link" aria-label={"View public message " + entry.title}>Public page</Link>}
        {kind === "streams" && entry.slug && <Link href={"/streams/" + encodeURIComponent(entry.slug)} className="directory-text-link" aria-label={"View public stream " + entry.title}>Public page</Link>}
        <details className="directory-more"><summary>More actions<span className="sr-only"> for {label}</span></summary><div className="pt-2"><RecordActionDialog secondary actionKey={kind + ":" + entry.id} label="Delete" title={"Delete " + label + "?"} description={kind === "streams" && entry.isLive ? "This stream is selected live. Deleting its record can leave Watch online without a selected broadcast. It does not stop the broadcast on its platform." : "Remove this " + editorialInfo[kind].singular + " from the church lists? Review its publishing state and related information before continuing."} confirmLabel={"Delete " + editorialInfo[kind].singular} pendingLabel="Deleting…" successMessage="Deletion confirmed." errorMessage="Deletion could not be confirmed. Review the refreshed list before trying again; related records may prevent deletion." busy={busy} onConfirm={() => onDelete(entry.id)} /></div></details>
      </div>
      {kind === "content" && <div className="schedule-context"><p className="schedule-context-label">Tags and scripture</p><div className="editorial-tags">{entry.tags?.slice(0, 4).map((tag) => <span key={tag} className="record-tag">{tag}</span>)}{entry.tags && entry.tags.length > 4 && <span className="directory-caption">{entry.tags.length - 4} more tags in the record.</span>}</div>{!entry.tags?.length && <p className="directory-caption">{entry.tags ? "No tags added" : "Tags unavailable"}</p>}{entry.scriptures?.length ? <p className="directory-caption">{entry.scriptures.slice(0, 2).join(" · ")}{entry.scriptures.length > 2 ? ` · ${entry.scriptures.length - 2} more references in the record` : ""}</p> : <p className="directory-caption">{entry.scriptures ? "No scripture references added" : "Scripture references unavailable"}</p>}</div>}
      {kind === "publications" && <div className="schedule-context"><p className="schedule-context-label">About this resource</p><p className="directory-caption editorial-description">{entry.description || "No description added."}</p></div>}
      {kind === "streams" && <div className="schedule-context"><p className="schedule-context-label">Broadcast destinations</p>{entry.platforms?.length ? <ul className="schedule-connections">{entry.platforms.map((platform) => <li key={platform.id}>{platform.href ? <a href={platform.href} target="_blank" rel="noopener noreferrer">{platform.name}<span className="sr-only"> (new tab)</span></a> : <span className="directory-caption">{platform.name} · Link unavailable</span>}</li>)}</ul> : <p className="directory-caption">{entry.platforms ? "No platforms connected. Add a destination in Edit stream." : "Platform details unavailable."}</p>}</div>}
    </li>;
  })}</ul>;
}
