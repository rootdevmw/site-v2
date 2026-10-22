"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/app/modules/users/types/user.types";
import { useLinkUserToMember, useUnlinkUserFromMember } from "@/app/modules/users/hooks/useUserActions";
import { useDebounce } from "@/app/modules/members/hooks/useDebounce";
import { getAccountMemberPage, type AccountMemberCandidate } from "@/lib/api/account-records";
import { retryRecordRequest } from "@/lib/utils/record-details";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";
import { RecordActionDialog } from "./RecordActionDialog";
import { RecordPager } from "./RecordPager";

const memberName = (member: Pick<AccountMemberCandidate, "firstName" | "lastName">) => [member.firstName, member.lastName].filter(Boolean).join(" ") || "Unnamed profile";

export function UserMemberPanel({ user, refreshing }: { user: User; refreshing: boolean }) {
  const [open, setOpen] = useState(false);
  const link = useLinkUserToMember();
  const unlink = useUnlinkUserFromMember();
  const busy = refreshing || link.isPending || unlink.isPending;
  return <div className="space-y-4">
    {user.member ? <p className="text-sm leading-8 wrap-anywhere">Linked to <Link href={"/dashboard/members/" + encodeURIComponent(user.member.id)} className="inline-flex min-h-11 items-center font-semibold text-[var(--brand-link)] underline">{memberName(user.member)}</Link></p> : <p className="record-empty">Link a directory profile to connect this account with a member’s church record.</p>}
    <div className="flex flex-wrap gap-3"><button type="button" className="record-button record-button-secondary" disabled={busy} onClick={() => setOpen(true)}>{user.member ? "Change linked profile" : "Link a profile"}</button>{user.member && <RecordActionDialog actionKey={user.id + ":" + user.member.id} label="Unlink profile" title="Unlink this directory profile?" description={"Remove the connection between " + user.email + " and " + memberName(user.member) + ". This keeps both records."} pendingLabel="Unlinking…" successMessage="The profile is unlinked." busy={busy} secondary onConfirm={() => unlink.mutateAsync({ userId: user.id, memberId: user.member!.id })} />}</div>
    {open && <UserMemberPicker user={user} pending={link.isPending} busy={busy} onClose={() => setOpen(false)} onLink={async (member) => { await link.mutateAsync({ userId: user.id, memberId: member.id, previousMemberId: user.member?.id }); setOpen(false); }} />}
  </div>;
}

function UserMemberPicker({ user, pending, busy, onClose, onLink }: { user: User; pending: boolean; busy: boolean; onClose: () => void; onLink: (member: AccountMemberCandidate) => Promise<void> }) {
  const inputId = useId();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AccountMemberCandidate | null>(null);
  const [error, setError] = useState("");
  const debouncedSearch = useDebounce(search);
  const query = useQuery({ queryKey: ["members", "account-link", debouncedSearch, page], queryFn: ({ signal }) => getAccountMemberPage({ page, search: debouncedSearch }, signal), retry: retryRecordRequest });
  const members = (query.data?.data ?? []).filter((member) => !member.deletedAt);
  const totalPages = Math.max(1, Math.ceil((query.data?.meta?.total ?? 0) / (query.data?.meta?.limit ?? 20)));
  const searching = search !== debouncedSearch;
  const alreadyLinked = selected && (selected.userId || selected.id === user.member?.id);
  async function confirm() {
    if (!selected || alreadyLinked || busy || query.isFetching || searching) return;
    setError("");
    try { await onLink(selected); }
    catch { setError("The link could not be confirmed. Review the current account link and try again. The selected profile may already belong to another account."); }
  }
  return <Dialog open onClose={onClose} closeDisabled={pending} title="Link a directory profile" description={"Choose the profile for " + user.email + "."}>
    <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">Search the directory</label><input id={inputId} type="search" autoComplete="off" className="record-input" value={search} disabled={pending} onChange={(event) => { setSearch(event.target.value); setPage(1); setSelected(null); }} placeholder="First or last name" />
    <div className="mt-4" aria-busy={query.isFetching || searching}>{query.isPending || searching ? <p role="status" className="record-empty py-4">Searching profiles…</p> : query.isError ? <div role="alert"><p className="record-empty">The directory could not be loaded.</p><button type="button" className="record-button record-button-secondary mt-3" onClick={() => { void query.refetch(); }}>Try again</button></div> : <>
      <fieldset disabled={pending}><legend className="sr-only">Select a directory profile</legend><div className="max-h-72 overflow-y-auto overscroll-contain">{members.map((member) => <label key={member.id} className="flex min-h-16 cursor-pointer items-start gap-3 border-b border-[#e7e0d5] py-3"><input type="radio" name={inputId + "-profile"} value={member.id} checked={selected?.id === member.id} disabled={!!member.userId || member.id === user.member?.id} onChange={() => setSelected(member)} className="mt-1 size-4 shrink-0 accent-[var(--brand-link)]" /><span className="min-w-0"><span className="block text-sm font-semibold wrap-anywhere">{memberName(member)}</span><span className="mt-1 block text-xs leading-6 text-[#6c6257]">Profile ID {member.id}{member.userId || member.id === user.member?.id ? " · Already linked to an account" : ""}</span></span></label>)}{!members.length && <p className="record-empty py-4">No profiles on this page. Try another search or directory page.</p>}</div></fieldset>
      <RecordPager page={page} totalPages={totalPages} onPageChange={(next) => { setPage(next); setSelected(null); }} disabled={pending || query.isFetching} label="Profile directory pages" />
    </>}</div>
    {selected && <p className="record-empty mt-5 wrap-anywhere"><strong>Selected: {memberName(selected)}</strong>{user.member && <span className="block">This replaces the link to {memberName(user.member)}.</span>}</p>}
    {error && <p role="alert" className="mt-4 text-sm leading-7 text-red-800">{error}</p>}
    <div className="mt-6 flex flex-wrap gap-3 border-t border-[#e7e0d5] pt-5"><button type="button" disabled={busy || query.isFetching || searching || !selected || !!alreadyLinked} onClick={() => { void confirm(); }} className="record-button record-button-primary">{pending ? <InlineLoader message="Linking profile…" /> : "Link selected profile"}</button><button type="button" onClick={onClose} disabled={pending} className="record-button record-button-secondary">Cancel</button></div>
  </Dialog>;
}
