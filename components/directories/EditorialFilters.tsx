"use client";

import { useId, type FormEvent } from "react";
import { editorialInfo, readEditorialFilters, type EditorialFilters as Filters, type EditorialKind } from "@/lib/utils/editorial-lists";
import { ManagementOptionFilter, type ManagementOptionsQuery } from "./ManagementOptionFilter";

export function EditorialFilters({ kind, filters, choices, pending, onApply, onReset }: { kind: EditorialKind; filters: Filters; choices: ManagementOptionsQuery; pending: boolean; onApply: (filters: Filters) => void; onReset: () => void }) {
  const id = useId();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) if (typeof value === "string") params.set(key, value);
    onApply(readEditorialFilters(kind, params));
  }
  return <form className="directory-filters" onSubmit={submit} aria-label={"Filter " + editorialInfo[kind].title.toLowerCase()}>
    <div className="directory-filter directory-search"><label htmlFor={id + "-search"}>{kind === "content" ? "Title or message text" : "Title"}</label><input id={id + "-search"} type="search" name="search" defaultValue={filters.search} className="record-input" placeholder={"Search " + editorialInfo[kind].resultLabel + "…"} /></div>
    {kind !== "streams" && <div className="directory-filter"><label htmlFor={id + "-status"}>Publishing status</label><select id={id + "-status"} name="status" className="record-input" defaultValue={filters.status}><option value="">All statuses</option><option value="Draft">Draft</option><option value="Published">Published</option></select></div>}
    {kind === "content" && <ManagementOptionFilter id={id + "-type"} label="Content type" name="typeId" value={filters.typeId} query={choices} />}
    {kind === "streams" && <>
      <div className="directory-filter"><label htmlFor={id + "-live"}>Live selection</label><select id={id + "-live"} name="isLive" className="record-input" defaultValue={filters.isLive}><option value="">All selections</option><option value="true">Selected live</option><option value="false">Not selected live</option></select></div>
      <ManagementOptionFilter id={id + "-platform"} label="Platform" name="platformId" value={filters.platformId} query={choices} allLabel="All platforms" />
    </>}
    <div className="directory-filter-actions"><button type="submit" disabled={pending} className="record-button record-button-primary">{pending ? "Applying…" : "Apply filters"}</button><button type="button" onClick={onReset} disabled={pending} className="record-button record-button-secondary">Reset</button></div>
  </form>;
}
