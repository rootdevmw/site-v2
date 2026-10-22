"use client";

import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMemberDirectoryPage } from "@/lib/api/group-records";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { getHomecellMove, memberName, normalizeGroupMembers, type GroupKind, type GroupMember } from "@/lib/utils/group-members";
import { retryRecordRequest } from "@/lib/utils/record-details";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";
import { RecordPager } from "./RecordPager";

export function MemberAssignmentDialog({ kind, groupId, groupName, assignedIds, onClose, onAssign, isPending }: {
  kind: GroupKind; groupId: string; groupName: string; assignedIds: Set<string>;
  onClose: () => void; onAssign: (member: GroupMember) => Promise<unknown>; isPending: boolean;
}) {
  const inputId = useId();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<GroupMember | null>(null);
  const [error, setError] = useState("");
  const debouncedSearch = useDebounce(search);
  const directory = useQuery({
    queryKey: ["members", "assignment", debouncedSearch, page],
    queryFn: ({ signal }) => getMemberDirectoryPage({ page, limit: 20, search: debouncedSearch }, signal),
    retry: retryRecordRequest,
  });
  const members = normalizeGroupMembers(directory.data?.data);
  const totalPages = Math.max(1, Math.ceil((directory.data?.meta?.total ?? 0) / 20));
  const move = selected && kind === "homecell" ? getHomecellMove(selected, groupId) : null;
  const searchPending = search !== debouncedSearch;

  async function assign() {
    if (!selected || isPending || assignedIds.has(selected.id)) return;
    setError("");
    try {
      await onAssign(selected);
      onClose();
    } catch {
      setError("The assignment could not be confirmed. Review the current membership and try again if needed.");
    }
  }

  return <Dialog open onClose={onClose} closeDisabled={isPending} title="Add a member" description={"Choose a person for " + groupName + "."}>
    <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">Search the church directory</label>
    <input id={inputId} type="search" autoComplete="off" className="record-input" placeholder="First or last name" value={search} disabled={isPending} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
    <div className="mt-5" aria-busy={directory.isFetching || searchPending}>
      {directory.isPending || searchPending ? <p role="status" className="record-empty py-4">Searching the directory…</p> : directory.isError ? <div role="alert"><p className="record-empty">The directory could not be loaded.</p><button type="button" className="record-button record-button-secondary mt-3" onClick={() => { void directory.refetch(); }}>Try again</button></div> : <>
        <fieldset disabled={isPending}>
          <legend className="sr-only">Choose a member</legend>
          <div className="max-h-72 overflow-y-auto overscroll-contain">
            {members.map((member) => <label key={member.id} className="flex min-h-16 cursor-pointer items-start gap-3 border-b border-[#e7e0d5] py-3 last:border-0">
              <input type="radio" name={inputId + "-member"} value={member.id} checked={selected?.id === member.id} disabled={assignedIds.has(member.id)} onChange={() => setSelected(member)} className="mt-1 size-4 shrink-0 accent-[#743c21]" />
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold wrap-anywhere">{memberName(member)}</span><span className="mt-1 block text-xs leading-6 text-[#6c6257]">ID {member.id}{member.location ? " · " + member.location : ""}{assignedIds.has(member.id) ? " · Already assigned" : ""}</span></span>
            </label>)}
            {!members.length && <p className="record-empty py-3">No available people on this page. Try another name or directory page.</p>}
          </div>
        </fieldset>
        <RecordPager page={page} totalPages={totalPages} onPageChange={setPage} disabled={isPending || directory.isFetching} label="Member directory pages" />
      </>}
    </div>
    {selected && <p className="mt-5 rounded-xl border border-[#e7e0d5] bg-white p-4 text-sm leading-7 wrap-anywhere"><strong>Selected: {memberName(selected)}</strong>{move && <span className="mt-1 block">This will move them from {move.fromName} to {groupName}.</span>}</p>}
    {kind === "homecell" && !move && <p className="record-empty mt-4">A person can belong to one homecell. Assigning them here replaces any previous homecell assignment.</p>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-900">{error}</p>}
    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#e7e0d5] pt-5">
      <button type="button" onClick={onClose} disabled={isPending} className="record-button record-button-secondary">Cancel</button>
      <button type="button" onClick={assign} disabled={isPending || !selected || assignedIds.has(selected.id)} aria-busy={isPending} className="record-button record-button-primary">{isPending ? <InlineLoader message="Updating membership…" /> : move ? "Move to this homecell" : "Add member"}</button>
    </div>
  </Dialog>;
}
