"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { useGroupLeadership } from "@/lib/hooks/useGroupEditor";
import { directoryPageState } from "@/lib/utils/directory-records";
import { readableRecordLabel, type RelatedRecord } from "@/lib/utils/record-details";
import type { LeadershipPerson } from "@/lib/utils/group-editor";
import { DirectoryError, DirectoryLoading } from "./DirectoryList";
import { RecordPager } from "@/components/records/RecordPager";

export function GroupLeadershipPicker({ id, label, value, initialPerson, actor, disabled, error, onChange }: { id: string; label: string; value?: string; initialPerson?: RelatedRecord | null; actor: { id: string; roles: string[] } | null; disabled: boolean; error?: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<RelatedRecord | null>(null);
  const name = value ? chosen?.id === value ? chosen.name : initialPerson?.id === value ? initialPerson.name : "Current profile #" + value : "Not assigned";
  return <div className="member-form-field"><label htmlFor={id}>{label}</label><button type="button" id={id} className="record-input directory-picker" disabled={disabled} aria-haspopup="dialog" aria-describedby={error ? id + "-error" : undefined} onClick={() => setOpen(true)}><span>{name}</span><span aria-hidden="true">Choose</span></button>{value && <p className="member-form-help">Profile #{value}</p>}{value && <button type="button" className="directory-text-link" disabled={disabled} onClick={() => onChange("")}>Clear {label.toLowerCase()}</button>}{error && <p id={id + "-error"} className="member-form-error">{error}</p>}{open && <LeadershipSearch actor={actor} label={label} currentId={value} onClose={() => setOpen(false)} onSelect={(person) => { setChosen(person); onChange(person.id); setOpen(false); }} />}</div>;
}

export function LeadershipSearch({ actor, label, currentId, onClose, onSelect }: { actor: { id: string; roles: string[] } | null; label: string; currentId?: string; onClose: () => void; onSelect: (person: LeadershipPerson) => void }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ page: 1, search: "" });
  const [selected, setSelected] = useState<LeadershipPerson | null>(null);
  const query = useGroupLeadership(filters, actor);
  const state = query.data ? directoryPageState(filters.page, query.data.total, query.data.limit) : null;
  const results = useRef<HTMLDivElement>(null);
  const previous = useRef(filters);
  useEffect(() => { if (previous.current === filters || query.isPending) return; previous.current = filters; results.current?.focus({ preventScroll: true }); results.current?.scrollIntoView({ block: "nearest" }); }, [filters, query.isPending]);
  return <Dialog open onClose={onClose} title={"Choose " + label.toLowerCase()} description="Search the church directory. This assignment does not change account access or add group members.">
    <label htmlFor="group-leadership-search" className="mb-2 block text-sm font-semibold">First or last name</label><div className="prayer-team-search"><input id="group-leadership-search" type="search" autoComplete="off" className="record-input" value={search} maxLength={200} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); setFilters({ page: 1, search: search.trim() }); } }} /><button type="button" className="record-button record-button-secondary" disabled={query.isFetching} onClick={() => setFilters({ page: 1, search: search.trim() })}>Search profiles</button></div>
    <div className="mt-4" ref={results} tabIndex={-1} role="region" aria-label={label + " directory results"} aria-busy={query.isFetching}>
      {query.isPending ? <DirectoryLoading label="Finding directory profiles…" /> : query.isError ? <DirectoryError noun="leadership directory" error={query.error} onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : query.data && state && <>
        {state.outOfRange ? <div className="directory-message"><h3>This page is no longer available</h3><button type="button" className="record-button record-button-secondary" onClick={() => setFilters({ ...filters, page: state.totalPages })}>Go to last available page</button></div> : <>
          <p className="member-form-help" role="status">{query.data.total ? `${state.start}–${state.end} of ${query.data.total} profiles` : "0 profiles"}</p><fieldset className="prayer-team-options group-leadership-options" disabled={query.isFetching} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }}><legend className="sr-only">Choose one {label.toLowerCase()} profile</legend>{query.data.data.map((person) => <label key={person.id} className="prayer-team-option"><input type="radio" name="group-leadership-person" value={person.id} checked={selected?.id === person.id} onChange={() => setSelected(person)} /><span><strong>{person.name}</strong><span>{readableRecordLabel(person.prefix)} · Profile #{person.id}{person.id === currentId ? " · Current assignment" : ""}</span>{person.location && <span>{person.location}</span>}</span></label>)}</fieldset>{!query.data.data.length && <p className="member-form-help mt-3">No matching profiles. Try another name, or create the person in the member directory first.</p>}<RecordPager page={filters.page} totalPages={state.totalPages} onPageChange={(page) => setFilters({ ...filters, page })} disabled={query.isFetching} label="Leadership directory pages" />
        </>}
      </>}
    </div>{selected && <p className="member-form-help mt-4" role="status">Selected: <strong>{selected.name}</strong> · Profile #{selected.id}</p>}<div className="member-form-actions mt-5"><button type="button" className="record-button record-button-primary" disabled={!selected || query.isPending || query.isError || query.isFetching} onClick={() => { if (selected) onSelect(selected); }}>Use selected profile</button><button type="button" className="record-button record-button-secondary" onClick={onClose}>Cancel</button></div>
  </Dialog>;
}
