"use client";
import { useEffect, useRef, useState } from "react";
import { useEligiblePrayerAccounts } from "@/lib/hooks/usePrayerTeam";
import { prayerTeamFilterError, prayerTeamName, prayerTeamWriteError, type PrayerTeamAccount, type PrayerTeamFilters } from "@/lib/utils/prayer-team";
import { directoryPageState } from "@/lib/utils/directory-records";
import { DirectoryError, DirectoryLoading } from "./DirectoryList";

export function PrayerTeamPicker({ actor, busy, onAdd, onCancel, onSaved }: { actor: { id: string; roles: string[] } | null; busy: boolean; onAdd: (id: string) => Promise<unknown>; onCancel: () => void; onSaved: () => void }) {
  const [filters, setFilters] = useState<PrayerTeamFilters>({ page: 1, search: "" });
  const [selected, setSelected] = useState<PrayerTeamAccount | null>(null);
  const [error, setError] = useState("");
  const query = useEligiblePrayerAccounts(filters, actor);
  const filterError = prayerTeamFilterError(filters);
  const state = query.data ? directoryPageState(filters.page, query.data.total, query.data.limit) : null;
  const results = useRef<HTMLDivElement>(null);
  const previous = useRef(filters);
  const submitting = useRef(false);
  useEffect(() => {
    if (previous.current === filters || query.isPending) return;
    previous.current = filters;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "nearest" });
  }, [filters, query.isPending]);
  async function add() {
    if (!selected || busy || query.isFetching || query.isError || submitting.current) return;
    submitting.current = true;
    setError("");
    try { await onAdd(selected.userId); onSaved(); }
    catch (failure) { setError(prayerTeamWriteError(failure, "add")); setSelected(null); }
    finally { submitting.current = false; }
  }
  return <div className="prayer-team-picker">
    <p className="directory-caption">Choose an active account with a linked directory profile and email. Accounts already on the team are excluded. Team membership does not grant dashboard access.</p>
    <form className="prayer-team-search" aria-label="Search eligible accounts" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setFilters({ page: 1, search: String(data.get("search") || "").trim() }); }}>
      <div className="directory-filter"><label htmlFor="eligible-account-search">Name or email</label><input id="eligible-account-search" name="search" className="record-input" type="search" maxLength={200} disabled={busy} /></div><button type="submit" className="record-button record-button-secondary" disabled={busy || query.isFetching}>Search accounts</button>
    </form>
    <div ref={results} tabIndex={-1} role="region" aria-label="Eligible accounts" aria-busy={query.isFetching}>
      {filterError ? <p role="alert" className="directory-notice">{filterError}</p> : query.isPending ? <DirectoryLoading label="Finding eligible accounts…" /> : query.isError ? <DirectoryError error={query.error} noun="eligible account list" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : query.data && state && <>
        <p className="directory-caption" role="status">{query.data.total ? `${state.start}–${state.end} of ${query.data.total} eligible accounts${filters.search ? ` matching “${filters.search}”` : ""}` : "0 eligible accounts"}</p>
        {state.outOfRange ? <div className="directory-message"><h3>This page is no longer available</h3><button type="button" className="record-button record-button-secondary" disabled={busy} onClick={() => setFilters({ ...filters, page: state.totalPages })}>Go to last available page</button></div> : query.data.data.length ? <fieldset className="prayer-team-options" disabled={busy || query.isFetching}><legend className="sr-only">Choose one account to add</legend>{query.data.data.map((account) => <label key={account.userId} className="prayer-team-option"><input type="radio" name="prayer-team-account" value={account.userId} checked={selected?.userId === account.userId} onChange={() => setSelected(account)} /><span><strong>{prayerTeamName(account)}</strong><span>{account.email}</span><span>Account #{account.userId}</span></span></label>)}</fieldset> : <div className="directory-message"><h3>{filters.search ? "No matching eligible accounts" : "No accounts available to add"}</h3><p>Try another name or email. An administrator can link an account to a directory profile if needed.</p></div>}
        {state.totalPages > 1 && !state.outOfRange && <nav className="directory-pager" aria-label="Eligible account pages"><button type="button" className="record-button record-button-secondary" disabled={busy || query.isFetching || filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button><span aria-current="page">Page {filters.page} of {state.totalPages}</span><button type="button" className="record-button record-button-secondary" disabled={busy || query.isFetching || filters.page === state.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button></nav>}
      </>}
    </div>
    {selected && <div className="directory-notice" role="status"><p>Selected: <strong>{prayerTeamName(selected)}</strong> · {selected.email} · Account #{selected.userId}</p><p>They will be included in future prayer request and completion notifications.</p><button type="button" className="directory-text-link" disabled={busy} onClick={() => setSelected(null)}>Clear selection</button></div>}
    {error && <p role="alert" className="directory-notice">{error}</p>}
    <div className="prayer-team-picker-actions"><button type="button" className="record-button record-button-primary" disabled={!selected || busy || query.isFetching || query.isError || !!filterError} onClick={() => { void add(); }}>{busy ? "Adding to team…" : "Add selected account"}</button><button type="button" className="record-button record-button-secondary" disabled={busy} onClick={onCancel}>Cancel</button></div>
  </div>;
}
