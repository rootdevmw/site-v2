"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";
import { useGroupMembership } from "@/lib/hooks/useGroupMembership";
import { memberName, type GroupKind, type GroupMember } from "@/lib/utils/group-members";
import { readableRecordLabel } from "@/lib/utils/record-details";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";
import { MemberAssignmentDialog } from "./MemberAssignmentDialog";
import { RecordPager } from "./RecordPager";
import { RecordSection } from "./RecordLayout";

export function GroupMembersPanel({ kind, groupId, groupName, members, refreshing = false, importAction }: {
  kind: GroupKind; groupId: string; groupName: string; members: GroupMember[]; refreshing?: boolean; importAction?: ReactNode;
}) {
  const searchId = useId();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");
  const mutation = useGroupMembership(kind, groupId);
  const assignedIds = new Set(members.map((member) => member.id));
  const filtered = members.filter((member) => memberName(member).toLowerCase().includes(search.trim().toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const busy = mutation.add.isPending || mutation.remove.isPending || refreshing;

  return <RecordSection title="Members" description="Open a profile or manage this group’s membership." aside={<span>{members.length} assigned</span>}>
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <button type="button" onClick={() => setAdding(true)} disabled={busy} className="record-button record-button-secondary"><FiPlus aria-hidden="true" />Add member</button>
      {importAction}
      {refreshing && <span role="status" className="text-xs text-[#6c6257]">Refreshing membership…</span>}
    </div>
    {feedback && <p role="status" className="mb-5 rounded-xl border border-[#d7e8cf] bg-[#edf5e9] p-3 text-sm leading-6 text-[#365c29]">{feedback}</p>}
    {members.length > 0 && <div className="mb-5"><label htmlFor={searchId} className="mb-2 block text-xs font-medium text-[#6c6257]">Find someone in this group</label><input id={searchId} type="search" className="record-input" value={search} placeholder="Search assigned members" onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>}
    <RecordMemberList members={visible} disabled={busy} groupName={groupName} onRemove={async (member) => {
      setFeedback("");
      await mutation.remove.mutateAsync(member.id);
      setFeedback(memberName(member) + " was removed from this " + kind + ".");
    }} />
    {!filtered.length && <p className="record-empty">{members.length ? "No assigned members match that name." : "No members are assigned yet. Add someone from the church directory to get started."}</p>}
    <RecordPager page={currentPage} totalPages={totalPages} onPageChange={setPage} label="Assigned member pages" />
    {adding && <MemberAssignmentDialog kind={kind} groupId={groupId} groupName={groupName} assignedIds={assignedIds} isPending={mutation.add.isPending} onClose={() => setAdding(false)} onAssign={async (member) => {
      if (assignedIds.has(member.id)) throw new Error("Already assigned");
      setFeedback("");
      await mutation.add.mutateAsync(member.id);
      setFeedback(memberName(member) + " was added to this " + kind + ".");
    }} />}
  </RecordSection>;
}

export function RecordMemberList({ members, groupName, disabled, onRemove }: { members: GroupMember[]; groupName: string; disabled?: boolean; onRemove: (member: GroupMember) => Promise<unknown> }) {
  return <ul className="record-members-list">{members.map((member) => <li key={member.id}>
    <Link href={"/dashboard/members/" + encodeURIComponent(member.id)} className="record-member-profile">
      <span aria-hidden="true" className="record-member-initials">{[member.firstName, member.lastName].map((part) => part?.charAt(0)).join("").toUpperCase()}</span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold wrap-anywhere">{memberName(member)}</span><span className="mt-1 block text-xs leading-6 text-[#6c6257]">{readableRecordLabel(member.status, "Assigned")} · ID {member.id}</span></span>
      <FiArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-[#743c21]" />
    </Link>
    <DeleteConfirmButton triggerLabel="Remove" title="Remove from this group?" confirmLabel="Remove member" description={"Remove " + memberName(member) + " from " + groupName + "? Their church directory profile will be kept."} disabled={disabled} onConfirm={() => onRemove(member)} className="min-h-11 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-50" />
  </li>)}</ul>;
}
