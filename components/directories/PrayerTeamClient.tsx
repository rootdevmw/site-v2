"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { usePrayerTeam, usePrayerTeamActions } from "@/lib/hooks/usePrayerTeam";
import { prayerTeamFilterError, prayerTeamHref, prayerTeamWriteError, readPrayerTeamFilters } from "@/lib/utils/prayer-team";
import { directoryPageState } from "@/lib/utils/directory-records";
import { Dialog } from "@/components/ui/Dialog";
import { DirectoryError, DirectoryLoading, ManagementPager } from "./DirectoryList";
import { PrayerTeamList } from "./PrayerTeamList";
import { PrayerTeamPicker } from "./PrayerTeamPicker";

export function PrayerTeamClient() {
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const filters = readPrayerTeamFilters(useSearchParams());
  const filterError = prayerTeamFilterError(filters);
  const query = usePrayerTeam(filters, actor);
  const actions = usePrayerTeamActions();
  const busy = actions.add.isPending || actions.remove.isPending;
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ failed: boolean; text: string } | null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const [navigating, startTransition] = useTransition();
  const router = useRouter();
  const acting = useRef(false);
  const results = useRef<HTMLDivElement>(null);
  const href = prayerTeamHref(filters);
  const previous = useRef(href);
  const state = query.data ? directoryPageState(filters.page, query.data.total, query.data.limit) : null;
  useEffect(() => {
    if (previous.current === href || (query.isPending && !filterError) || navigating) return;
    previous.current = href;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "start" });
  }, [href, query.isPending, filterError, navigating]);
  async function change(operation: "add" | "remove", userId: string) {
    if (acting.current || !permitted) throw new Error("Team management is unavailable.");
    acting.current = true;
    setFeedback(null);
    try { await actions[operation].mutateAsync(userId); setFeedback({ failed: false, text: `Account #${userId} ${operation === "add" ? "is now on" : "is no longer on"} the prayer team. The roster and available accounts have been refreshed.` }); }
    catch (error) { setFeedback({ failed: true, text: prayerTeamWriteError(error, operation) }); throw error; }
    finally { acting.current = false; }
  }
  function reset() { setResetVersion((value) => value + 1); startTransition(() => router.push("/dashboard/attention/manage", { scroll: false })); }
  return <section className="record-page directory-page" aria-labelledby="prayer-team-title">
    <header className="directory-header"><div><p className="record-eyebrow">People &amp; pastoral care</p><h1 className="record-title" id="prayer-team-title">Prayer team</h1><p className="record-description">Bring together the people who receive prayer requests and completion notifications, so each request is met with care.</p><p className="directory-caption">Team membership manages email notifications. Dashboard access follows each account’s existing roles.</p></div>{permitted && <div className="directory-header-actions"><button type="button" className="record-button record-button-primary" disabled={busy} onClick={() => setAdding(true)}>Add to prayer team</button><Link href="/dashboard/attention/prayers" className="record-button record-button-secondary">Prayer requests</Link><Link href="/dashboard/attention/visitors" className="record-button record-button-secondary">Visitor follow-up</Link></div>}</header>
    {!permitted ? <DirectoryError noun="prayer team" error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} /> : <>
      <form key={href + ":" + resetVersion} className="directory-filters" aria-label="Find a prayer team member" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); startTransition(() => router.push(prayerTeamHref({ page: 1, search: String(data.get("search") || "").trim() }), { scroll: false })); }}><div className="directory-filter directory-search"><label htmlFor="team-search">Member name or email</label><input id="team-search" name="search" type="search" className="record-input" maxLength={200} defaultValue={filters.search} /></div><div className="directory-filter-actions"><button type="submit" className="record-button record-button-primary" disabled={navigating}>{navigating ? "Searching…" : "Search team"}</button><button type="button" className="record-button record-button-secondary" onClick={reset} disabled={navigating}>Reset search</button></div></form>
      {filters.search && <p className="directory-applied">Showing: <span>Search “{filters.search}”</span></p>}
      {feedback && <p role={feedback.failed ? "alert" : "status"} className="directory-notice">{feedback.text}</p>}
      <div ref={results} role="region" aria-label="Prayer team results" tabIndex={-1} aria-busy={!filterError && (query.isFetching || navigating)}>
        {filterError ? <div role="alert" className="directory-message"><h2>Check your search</h2><p>{filterError} Update the search above or reset it.</p></div> : query.isPending || navigating ? <DirectoryLoading label="Loading prayer team…" /> : query.isError ? <DirectoryError noun="prayer team" error={query.error} onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : query.data && state && <>
          {state.outOfRange ? <div className="directory-message"><h2>This page is no longer available</h2><p>Team membership may have changed. Your search is preserved.</p><Link href={prayerTeamHref({ ...filters, page: state.totalPages })} scroll={false} className="record-button record-button-secondary">Go to last available page</Link></div> : <>
            <div className="directory-results-heading"><p role="status">{query.data.total ? `${state.start}–${state.end} of ${query.data.total} ${filters.search ? "matching " : ""}team members` : "0 team members"}</p><span>{query.isFetching ? "Refreshing…" : "Most recently added first"}</span></div>
            {query.data.data.length ? <PrayerTeamList records={query.data.data} canViewAccounts={hasRequiredRole(actor?.roles ?? [], ["ADMIN"])} busy={busy || query.isFetching} onRemove={(id) => change("remove", id)} /> : <div className="directory-message"><h2>{filters.search ? "No matching team members" : "Build your prayer team"}</h2><p>{filters.search ? "Try another name or email, or reset the search." : "Add people with active accounts and linked directory profiles to include them in future prayer notifications."}</p><button type="button" className="record-button record-button-secondary" onClick={filters.search ? reset : () => setAdding(true)}>{filters.search ? "Reset search" : "Find someone to add"}</button></div>}
            <ManagementPager page={filters.page} total={query.data.total} limit={query.data.limit} label="Prayer team pages" hrefForPage={(page) => prayerTeamHref({ ...filters, page })} />
          </>}
        </>}
      </div>
      <Dialog open={adding} onClose={() => { if (!busy) setAdding(false); }} closeDisabled={busy} title="Add to prayer team" description="Choose an account to include in future prayer notifications.">{adding && <PrayerTeamPicker actor={actor} busy={busy} onAdd={(id) => change("add", id)} onCancel={() => setAdding(false)} onSaved={() => setAdding(false)} />}</Dialog>
    </>}
  </section>;
}
