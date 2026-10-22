"use client";

import { ROLE_HIERARCHY } from "@/lib/auth/roles";
import type { AccessFilters as Filters, AccessKind } from "@/lib/utils/access-lists";

export function AccessFilters({ kind, filters, pending, onApply, onReset }: { kind: AccessKind; filters: Filters; pending: boolean; onApply: (filters: Filters) => void; onReset: () => void }) {
  return <form className="directory-filters" aria-label={kind === "users" ? "Filter accounts" : "Filter roles"} onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onApply({ page: 1, search: String(data.get("search") || "").trim(), role: String(data.get("role") || ""), linked: String(data.get("linked") || "") });
  }}>
    <div className="directory-filter directory-search"><label htmlFor="access-search">{kind === "users" ? "Email or profile name" : "Role name"}</label><input id="access-search" name="search" type="search" defaultValue={filters.search} className="record-input" placeholder={kind === "users" ? "Search accounts…" : "Search roles…"} /></div>
    {kind === "users" && <>
      <div className="directory-filter"><label htmlFor="access-role">Recorded role</label><select id="access-role" name="role" defaultValue={filters.role} className="record-input"><option value="">All roles</option>{ROLE_HIERARCHY.map((role) => <option key={role} value={role}>{role}</option>)}</select></div>
      <div className="directory-filter"><label htmlFor="access-linked">Directory profile</label><select id="access-linked" name="linked" defaultValue={filters.linked} className="record-input"><option value="">All accounts</option><option value="true">Linked to a profile</option><option value="false">No linked profile</option></select></div>
    </>}
    <div className="directory-filter-actions"><button type="submit" disabled={pending} className="record-button record-button-primary">{pending ? "Applying…" : "Apply filters"}</button><button type="button" disabled={pending} onClick={onReset} className="record-button record-button-secondary">Clear filters</button></div>
  </form>;
}
