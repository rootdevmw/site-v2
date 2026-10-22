"use client";

import { useId, type FormEvent } from "react";
import { DirectoryPersonFilter } from "./DirectoryPersonFilter";
import { directoryInfo, memberPrefixes, memberStatuses, readDirectoryFilters, type DirectoryFilters as Filters, type DirectoryKind } from "@/lib/utils/directory-records";
import { readableRecordLabel } from "@/lib/utils/record-details";

export function DirectoryFilters({ kind, filters, onApply, onReset, pending }: { kind: DirectoryKind; filters: Filters; onApply: (filters: Filters) => void; onReset: () => void; pending: boolean }) {
  const id = useId();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of values) if (typeof value === "string") params.set(key, value);
    onApply(readDirectoryFilters(kind, params));
  }
  return <form onSubmit={submit} className="directory-filters" aria-label={"Filter " + directoryInfo[kind].title.toLowerCase()}>
    <div className="directory-filter directory-search"><label htmlFor={id + "-search"}>{directoryInfo[kind].searchLabel}</label><input id={id + "-search"} type="search" name="search" className="record-input" defaultValue={filters.search} placeholder={kind === "members" ? "Search people…" : "Search " + kind + "…"} /></div>
    {kind === "members" && <>
      <div className="directory-filter"><label htmlFor={id + "-status"}>Membership status</label><select id={id + "-status"} name="status" className="record-input" defaultValue={filters.status}><option value="">All statuses</option>{memberStatuses.map((value) => <option key={value} value={value}>{readableRecordLabel(value)}</option>)}</select></div>
      <div className="directory-filter"><label htmlFor={id + "-prefix"}>Church title</label><select id={id + "-prefix"} name="prefix" className="record-input" defaultValue={filters.prefix}><option value="">All titles</option>{memberPrefixes.map((value) => <option key={value} value={value}>{readableRecordLabel(value)}</option>)}</select></div>
    </>}
    {kind === "ministries" && <><DirectoryPersonFilter name="leaderId" label="Leader" initialId={filters.leaderId} /><DirectoryPersonFilter name="overseerId" label="Overseer" initialId={filters.overseerId} /></>}
    <div className="directory-filter-actions"><button type="submit" disabled={pending} className="record-button record-button-primary">{pending ? "Applying…" : "Apply filters"}</button><button type="button" onClick={onReset} disabled={pending} className="record-button record-button-secondary">Reset</button></div>
  </form>;
}
