"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { RecordStatus } from "@/components/records/RecordLayout";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { directoryHref, directoryInfo, directoryPageState, type DirectoryEntry, type DirectoryFilters, type DirectoryKind, type DirectoryPerson } from "@/lib/utils/directory-records";
import { getPhoneHref, getRecordFailure, readableRecordLabel } from "@/lib/utils/record-details";

function Field({ label, children }: { label: string; children?: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children || <span className="directory-muted">Not provided</span>}</dd></div>;
}
function Person({ person }: { person?: DirectoryPerson | null }) {
  return person ? <Link href={"/dashboard/members/" + encodeURIComponent(person.id)}>{[person.firstName, person.lastName].filter(Boolean).join(" ") || "Profile #" + person.id}</Link> : <span className="directory-muted">Not assigned</span>;
}

export function DirectoryList({ kind, records, onDelete, busy = false }: { kind: DirectoryKind; records: DirectoryEntry[]; onDelete: (id: string) => Promise<unknown>; busy?: boolean }) {
  return <ul className="directory-list" aria-label={directoryInfo[kind].title + " results"}>{records.map((entry) => {
    const href = "/dashboard/" + kind + "/" + encodeURIComponent(entry.id);
    const phoneHref = getPhoneHref(entry.phone);
    return <li key={entry.id} className="directory-row">
      <div className="directory-identity">
        <span aria-hidden="true" className="directory-initials">{entry.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
        <div className="min-w-0"><h2><Link href={href}>{entry.name}</Link></h2>
          {kind === "members" && <p className="directory-caption">{entry.prefix ? readableRecordLabel(entry.prefix) + " · " : ""}Profile #{entry.id}</p>}
          {kind === "ministries" && <p className="directory-purpose">{entry.purpose || "Purpose not provided"}</p>}
          {kind === "homecells" && <p className="directory-caption">{entry.location || "Location not provided"}</p>}
        </div>
      </div>
      <dl className="directory-fields">
        {kind === "members" ? <>
          <Field label="Membership"><RecordStatus tone={entry.status === "MEMBER" ? "positive" : "neutral"}>{readableRecordLabel(entry.status)}</RecordStatus></Field>
          <Field label="Phone">{phoneHref ? <a href={phoneHref}>{entry.phone}</a> : entry.phone}</Field>
          <Field label="Location">{entry.location}</Field>
        </> : <>
          <Field label="Leader"><Person person={entry.leader} /></Field>
          <Field label="Overseer"><Person person={entry.overseer} /></Field>
          {kind === "homecells" && <Field label="Members">{entry.memberCount === undefined ? <span className="directory-muted">Count unavailable</span> : String(entry.memberCount)}</Field>}
        </>}
      </dl>
      <div className="directory-row-actions" role="group" aria-label={"Actions for " + entry.name}>
        <Link href={href} className="record-button record-button-secondary" aria-label={"View " + entry.name}>View</Link>
        <Link href={href + "/edit"} className="directory-text-link" aria-label={"Edit " + entry.name}>Edit</Link>
        <details className="directory-more"><summary>More actions<span className="sr-only"> for {entry.name}</span></summary><div className="pt-2">
          <RecordActionDialog secondary actionKey={kind + ":" + entry.id} label="Delete" title={"Delete " + entry.name + "?"} description={"Remove this " + directoryInfo[kind].singular + " from the directory? Review any related records before continuing."} confirmLabel={"Delete " + directoryInfo[kind].singular} pendingLabel="Deleting…" successMessage="Deletion confirmed." errorMessage="Deletion could not be confirmed. The list has been refreshed; review it before trying again. Related records may prevent deletion." busy={busy} onConfirm={() => onDelete(entry.id)} />
        </div></details>
      </div>
    </li>;
  })}</ul>;
}

export function DirectoryPager({ kind, filters, total, limit }: { kind: DirectoryKind; filters: DirectoryFilters; total: number; limit: number }) {
  return <ManagementPager page={filters.page} total={total} limit={limit} label={directoryInfo[kind].title + " pages"} hrefForPage={(page) => directoryHref(kind, { ...filters, page })} />;
}

export function ManagementPager({ page, total, limit, label, hrefForPage }: { page: number; total: number; limit: number; label: string; hrefForPage: (page: number) => string }) {
  const { totalPages } = directoryPageState(page, total, limit);
  if (totalPages <= 1) return null;
  return <nav aria-label={label} className="directory-pager">
    {page > 1 ? <Link href={hrefForPage(page - 1)} scroll={false} className="record-button record-button-secondary" aria-label="Previous page">Previous</Link> : <span className="record-button directory-muted" aria-disabled="true">Previous</span>}
    <span aria-current="page">Page {page} of {totalPages}</span>
    {page < totalPages ? <Link href={hrefForPage(page + 1)} scroll={false} className="record-button record-button-secondary" aria-label="Next page">Next</Link> : <span className="record-button directory-muted" aria-disabled="true">Next</span>}
  </nav>;
}

export function DirectoryLoading({ label = "Loading directory…" }: { label?: string }) {
  return <div role="status" className="record-page directory-loading"><span>{label}</span><div aria-hidden="true" className="motion-safe:animate-pulse">{[0, 1, 2].map((item) => <div key={item} className="directory-placeholder" />)}</div></div>;
}

export function DirectoryError({ error, onRetry, retrying, noun = "directory" }: { error: unknown; onRetry: () => void; retrying: boolean; noun?: string }) {
  const failure = getRecordFailure(error);
  return <div className="directory-message" role="alert">
    <h2>{failure === "forbidden" ? "Access unavailable" : failure === "session" ? "Please sign in again" : "Could not load this " + noun}</h2>
    <p>{failure === "forbidden" ? "Your account does not have permission to view these records." : failure === "session" ? "Your session may have expired. Sign in to continue." : "The " + noun + " could not be reached or returned an incomplete response. Your filters are preserved."}</p>
    {failure === "error" && <button type="button" disabled={retrying} onClick={onRetry} className="record-button record-button-primary">{retrying ? "Retrying…" : "Try again"}</button>}
    {failure === "session" && <Link href="/login" className="record-button record-button-primary">Sign in</Link>}
    <Link href="/dashboard" className="record-button record-button-secondary">Return to dashboard</Link>
  </div>;
}
