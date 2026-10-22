"use client";

import { useId, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/app/modules/users/types/user.types";
import { useSetRole, useRemoveRole } from "@/app/modules/roles/hooks/useRoleActions";
import { getAccountRoleCatalog } from "@/lib/api/account-records";
import { getAccountRoles, getAssignableAccountRoles } from "@/lib/utils/account-records";
import { retryRecordRequest } from "@/lib/utils/record-details";
import { RecordActionDialog } from "./RecordActionDialog";

export function UserRolesPanel({ user, canManage, refreshing }: { user: User; canManage: boolean; refreshing: boolean }) {
  const inputId = useId();
  const [selected, setSelected] = useState("");
  const catalog = useQuery({ queryKey: ["roles", "account-catalog"], queryFn: ({ signal }) => getAccountRoleCatalog(signal), enabled: canManage, retry: retryRecordRequest });
  const setRole = useSetRole();
  const resetRole = useRemoveRole();
  if (!canManage) return <p className="record-empty">Role changes are managed by a ROOT administrator.</p>;
  const roles = getAccountRoles(user.roles);
  const options = getAssignableAccountRoles(catalog.data ?? [], roles);
  const target = options.find((role) => role.id === selected);
  const busy = refreshing || setRole.isPending || resetRole.isPending;
  return <div className="space-y-5">
    {catalog.isPending ? <p role="status" className="record-empty">Loading available roles…</p> : catalog.isError ? <div role="alert"><p className="record-empty">The role catalog could not be loaded.</p><button type="button" className="record-button record-button-secondary mt-3" onClick={() => { void catalog.refetch(); }}>Try again</button></div> : <>
      <div><label htmlFor={inputId} className="mb-2 block text-sm font-semibold">Choose a different role</label><select id={inputId} className="record-input" value={target?.id ?? ""} onChange={(event) => setSelected(event.target.value)} disabled={busy || catalog.isFetching}><option value="">Select role</option>{options.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></div>
      {target && <RecordActionDialog actionKey={user.id + ":" + roles.join(",") + ":" + target.id} label="Change role" title="Change this account’s role?" description={"Change " + user.email + " from " + (roles.join(", ") || "no recorded role") + " to " + target.name + ". This changes the account’s dashboard access."} pendingLabel="Updating role…" successMessage="Role updated." busy={busy || catalog.isFetching} onConfirm={async () => { await setRole.mutateAsync({ userId: user.id, roleId: target.id }); setSelected(""); }} />}
    </>}
    {roles.length > 0 && !(roles.length === 1 && roles[0] === "VISITOR") && <div className="border-t border-[#e7e0d5] pt-4"><RecordActionDialog actionKey={user.id + ":reset:" + roles.join(",")} label="Reset to Visitor" title="Reset this account to Visitor?" description={"The existing role assignments for " + user.email + " will be replaced with VISITOR access. The account and directory profile remain available."} pendingLabel="Resetting role…" successMessage="The account now has Visitor access." busy={busy} secondary onConfirm={() => resetRole.mutateAsync({ userId: user.id })} /></div>}
  </div>;
}
