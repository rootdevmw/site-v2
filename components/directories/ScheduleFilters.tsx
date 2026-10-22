"use client";

import { useId, useState, type FormEvent } from "react";
import { readScheduleFilters, scheduleFilterError, scheduleInfo, type ScheduleFilters as Filters, type ScheduleKind } from "@/lib/utils/schedule-lists";

import { ManagementOptionFilter as OptionFilter, type ManagementOptionsQuery as OptionsQuery } from "./ManagementOptionFilter";

export function ScheduleFilters({ kind, filters, types, homecells, pending, onApply, onReset }: { kind: ScheduleKind; filters: Filters; types: OptionsQuery; homecells: OptionsQuery; pending: boolean; onApply: (filters: Filters) => void; onReset: () => void }) {
  const id = useId();
  const [dateMode, setDateMode] = useState(filters.fromDate ? "from" : filters.date ? "on" : "all");
  const [programDate, setProgramDate] = useState(filters.date || filters.fromDate);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) if (typeof value === "string") params.set(key, value);
    const next = readScheduleFilters(kind, params);
    const issue = scheduleFilterError(next);
    setError(issue);
    if (!issue) onApply(next);
  }
  return <form className="directory-filters" aria-label={"Filter " + scheduleInfo[kind].title.toLowerCase()} onSubmit={submit}>
    {kind !== "programs" && <div className="directory-filter directory-search"><label htmlFor={id + "-search"}>{kind === "events" ? "Event title" : "Template name"}</label><input id={id + "-search"} name="search" type="search" className="record-input" defaultValue={filters.search} placeholder={kind === "events" ? "Search events…" : "Search templates…"} /></div>}
    <OptionFilter id={id + "-type"} name="typeId" label={kind === "events" ? "Event type" : "Program type"} value={filters.typeId} query={types} />
    {kind === "events" && <>
      <div className="directory-filter"><label htmlFor={id + "-from"}>Starts on or after</label><input id={id + "-from"} type="date" name="startDate" className="record-input" defaultValue={filters.startDate} /></div>
      <div className="directory-filter"><label htmlFor={id + "-until"}>Starts on or before</label><input id={id + "-until"} type="date" name="endDate" className="record-input" defaultValue={filters.endDate} /></div>
    </>}
    {kind !== "events" && <OptionFilter id={id + "-homecell"} name="homecellId" label="Homecell" value={filters.homecellId} query={homecells} />}
    {kind === "programs" && <>
      <div className="directory-filter"><label htmlFor={id + "-mode"}>Program dates</label><select id={id + "-mode"} className="record-input" value={dateMode} onChange={(event) => setDateMode(event.target.value)}><option value="all">All dates</option><option value="on">On a date</option><option value="from">From a date onward</option></select></div>
      {dateMode !== "all" && <div className="directory-filter"><label htmlFor={id + "-date"}>{dateMode === "from" ? "From date" : "Program date"}</label><input id={id + "-date"} type="date" name={dateMode === "from" ? "fromDate" : "date"} value={programDate} required onChange={(event) => setProgramDate(event.target.value)} className="record-input" /></div>}
    </>}
    <div className="directory-filter-actions"><button type="submit" className="record-button record-button-primary" disabled={pending}>{pending ? "Applying…" : "Apply filters"}</button><button type="button" className="record-button record-button-secondary" onClick={onReset} disabled={pending}>Reset</button></div>
    {error && <p role="alert" className="schedule-filter-error">{error}</p>}
  </form>;
}
