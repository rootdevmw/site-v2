"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "@/components/ui/Dialog";
import { RecordPager } from "@/components/records/RecordPager";
import { getMemberDirectoryPage } from "@/lib/api/group-records";
import { memberName, normalizeGroupMembers, type GroupMember } from "@/lib/utils/group-members";
import { getRecordFailure, retryRecordRequest } from "@/lib/utils/record-details";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";

export function DirectoryPersonFilter({ label, name, initialId }: { label: string; name: string; initialId: string }) {
  const [value, setValue] = useState<{ id: string; name: string } | null>(initialId ? { id: initialId, name: "Profile #" + initialId } : null);
  const [open, setOpen] = useState(false);
  const labelId = useId();
  return <div className="directory-filter">
    <span id={labelId}>{label}</span>
    <input type="hidden" name={name} value={value?.id ?? ""} />
    <button type="button" aria-labelledby={labelId + " " + labelId + "-value"} className="record-input directory-picker" aria-haspopup="dialog" onClick={() => setOpen(true)}><span id={labelId + "-value"}>{value?.name ?? "Any " + label.toLowerCase()}</span><span aria-hidden="true">Change</span></button>
    {value && <button type="button" className="directory-text-link" onClick={() => setValue(null)}>Clear {label.toLowerCase()} filter</button>}
    {open && <PersonPicker label={label} currentId={value?.id} onClose={() => setOpen(false)} onSelect={(member) => { setValue({ id: member.id, name: memberName(member) }); setOpen(false); }} />}
  </div>;
}

export function PersonPicker({ label, currentId, onClose, onSelect }: { label: string; currentId?: string; onClose: () => void; onSelect: (member: GroupMember) => void }) {
  const inputId = useId();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GroupMember | null>(null);
  const debouncedSearch = useDebounce(search);
  const query = useQuery({
    queryKey: ["members", "leadership-filter", debouncedSearch, page],
    queryFn: ({ signal }) => getMemberDirectoryPage({ page, limit: 20, search: debouncedSearch }, signal),
    retry: retryRecordRequest,
  });
  const people = normalizeGroupMembers(query.data?.data);
  const totalPages = Math.max(1, Math.ceil((query.data?.meta?.total ?? 0) / (query.data?.meta?.limit || 20)));
  const waiting = search !== debouncedSearch;
  const failure = getRecordFailure(query.error);

  return <Dialog open onClose={onClose} title={"Filter by " + label.toLowerCase()} description="Choose a directory profile, then apply your list filters. This does not change any assignments.">
    <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">Search first or last name</label>
    <input id={inputId} type="search" className="record-input" autoComplete="off" value={search} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
    <div className="mt-4" aria-busy={query.isFetching || waiting}>
      {query.isPending || waiting ? <p role="status" className="record-empty">Searching the directory…</p> : query.isError ? <div role="alert">
        <p className="record-empty">{failure === "session" ? "Please sign in again to search the directory." : failure === "forbidden" ? "Your account cannot search the directory." : "The directory could not be loaded."}</p>
        {failure === "error" && <button type="button" className="record-button record-button-secondary mt-3" onClick={() => { void query.refetch(); }}>Try again</button>}
        {failure === "session" && <Link href="/login" className="record-button record-button-primary mt-3">Sign in</Link>}
      </div> : <>
        <fieldset className="max-h-72 overflow-y-auto overscroll-contain" onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }}><legend className="sr-only">Choose a {label.toLowerCase()} profile</legend>
          {people.map((person) => <label key={person.id} className="flex min-h-16 cursor-pointer items-start gap-3 border-b border-[#e7e0d5] py-3 last:border-0">
            <input type="radio" name={inputId + "-person"} value={person.id} checked={selected?.id === person.id} onChange={() => setSelected(person)} className="mt-1 size-4 shrink-0 accent-[var(--brand-link)]" />
            <span className="min-w-0 text-sm leading-7 wrap-anywhere"><strong className="block">{memberName(person)}</strong><span className="text-[#6c6257]">ID {person.id}{person.location ? " · " + person.location : ""}{person.id === currentId ? " · Current filter" : ""}</span></span>
          </label>)}
          {!people.length && <p className="record-empty">No matching people. Try another name.</p>}
        </fieldset>
        <RecordPager page={page} totalPages={totalPages} onPageChange={setPage} disabled={query.isFetching} label="Leadership filter directory pages" />
      </>}
    </div>
    {selected && <p className="record-empty mt-4 wrap-anywhere">Selected: <strong>{memberName(selected)}</strong> · ID {selected.id}</p>}
    <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-[#e7e0d5] pt-5">
      <button type="button" className="record-button record-button-secondary" onClick={onClose}>Cancel</button>
      <button type="button" className="record-button record-button-primary" disabled={!selected || query.isError || waiting} onClick={() => { if (selected) onSelect(selected); }}>Use this person</button>
    </div>
  </Dialog>;
}
