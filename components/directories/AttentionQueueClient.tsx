"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { useAttentionActions } from "@/app/modules/attention/hooks/useAttentionActions";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useAttentionQueue } from "@/lib/hooks/useAttentionQueue";
import { directoryPageState } from "@/lib/utils/directory-records";
import { attentionQueueFilterError, attentionQueueHref, attentionQueueInfo, attentionQueueOrderLabel, attentionQueueParams, queueStatuses, readAttentionQueueFilters, type AttentionQueueKind } from "@/lib/utils/attention-queues";
import { DirectoryError, DirectoryLoading, ManagementPager } from "./DirectoryList";
import { AttentionQueueFilters } from "./AttentionQueueFilters";
import { AttentionQueueList } from "./AttentionQueueList";

export function AttentionQueueClient({ kind }: { kind: AttentionQueueKind }) {
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const info = attentionQueueInfo[kind];
  const filters = readAttentionQueueFilters(kind, useSearchParams());
  const filterError = attentionQueueFilterError(kind, filters);
  const query = useAttentionQueue(kind, filters, actor);
  const actions = useAttentionActions();
  const mutation = kind === "prayers" ? actions.markPrayer : actions.markVisitor;
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [resetVersion, setResetVersion] = useState(0);
  const [feedback, setFeedback] = useState<{ failed: boolean; text: string } | null>(null);
  const acting = useRef(false);
  const filterKey = attentionQueueHref(kind, filters);
  const previousFilters = useRef(filterKey);
  const results = useRef<HTMLDivElement>(null);
  const state = query.data ? directoryPageState(filters.page, query.data.total, query.data.limit) : null;
  const filtered = !!attentionQueueParams(kind, filters, false).size;
  const statusLabel = queueStatuses(kind).find(({ value }) => value === filters.status)?.label || filters.status;
  useEffect(() => {
    if (previousFilters.current === filterKey || (query.isPending && !filterError) || navigating) return;
    previousFilters.current = filterKey;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "start" });
  }, [filterKey, query.isPending, filterError, navigating]);
  async function record(id: string) {
    if (acting.current || !permitted || !query.data?.canRecord || query.isFetching) throw new Error("Follow-up is not available.");
    acting.current = true;
    setFeedback(null);
    try {
      await mutation.mutateAsync(id);
      setFeedback({ failed: false, text: `Follow-up status confirmed for ${kind === "prayers" ? "request" : "visit"} #${id}. The queue and dashboard have been refreshed.` });
    } catch (error) {
      setFeedback({ failed: true, text: "The action could not be confirmed. Check the refreshed status before trying again. A linked directory profile is required to record follow-up." });
      throw error;
    } finally { acting.current = false; }
  }
  function reset() { setResetVersion((version) => version + 1); startTransition(() => router.push("/dashboard/attention/" + kind, { scroll: false })); }

  return <section className="record-page directory-page" aria-labelledby="queue-title">
    <header className="directory-header"><div><p className="record-eyebrow">People &amp; pastoral care</p><h1 id="queue-title" className="record-title">{info.title}</h1><p className="record-description">{info.description}</p><p className="directory-caption">{kind === "prayers" ? "Open work includes pending and reviewed requests." : "Open work includes visits awaiting acknowledgement. Completed visits remain available in the status filter."}</p></div>{permitted && <div className="directory-header-actions"><Link href={"/dashboard/attention/" + (kind === "prayers" ? "visitors" : "prayers")} className="record-button record-button-secondary">{kind === "prayers" ? "Visitor follow-up" : "Prayer requests"}</Link><Link href="/dashboard/attention/manage" className="record-button record-button-secondary">Prayer team</Link></div>}</header>
    {!permitted ? <DirectoryError noun="queue" error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} /> : <>
      <nav className="queue-scope-links" aria-label="Follow-up views"><Link href={attentionQueueHref(kind, { ...filters, page: 1, status: "open" })} scroll={false} aria-current={filters.status === "open" ? "page" : undefined}>{info.openLabel}</Link><Link href={attentionQueueHref(kind, { ...filters, page: 1, status: "all" })} scroll={false} aria-current={filters.status === "all" ? "page" : undefined}>All records</Link>{kind === "prayers" && <Link href={attentionQueueHref(kind, { ...filters, page: 1, status: "open", urgent: "true", sort: "priority" })} scroll={false}>Urgent open requests</Link>}</nav>
      <AttentionQueueFilters key={filterKey + ":" + resetVersion} kind={kind} filters={filters} pending={navigating} onApply={(next) => startTransition(() => router.push(attentionQueueHref(kind, next), { scroll: false }))} onReset={reset} />
      <p className="directory-applied">Showing: <span>{statusLabel}</span>{filters.search && <span>Search “{filters.search}”</span>}{filters.urgent && <span>{filters.urgent === "true" ? "Urgent" : "Not marked urgent"}</span>}{filters.from && <span>{info.dateLabel} from {filters.from}</span>}{filters.to && <span>Through {filters.to}</span>}</p>
      {feedback && <p role={feedback.failed ? "alert" : "status"} className="directory-notice">{feedback.text}</p>}
      <div ref={results} tabIndex={-1} role="region" aria-label={info.title + " results"} aria-busy={!filterError && (query.isFetching || navigating)}>
        {filterError ? <div className="directory-message" role="alert"><h2>Check your filters</h2><p>{filterError} Update the choices above or reset the queue.</p></div> : query.isPending || navigating ? <DirectoryLoading label="Loading follow-up queue…" /> : query.isError ? <DirectoryError noun="queue" error={query.error} onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : query.data && state && <>
          {!query.data.canRecord && <p className="directory-notice">You can review these records. To record follow-up, ask an administrator to link your account to a directory profile.</p>}
          {state.outOfRange ? <div className="directory-message"><h2>This page is no longer available</h2><p>The queue may have changed after follow-up. Your filters are preserved.</p><Link href={attentionQueueHref(kind, { ...filters, page: state.totalPages })} scroll={false} className="record-button record-button-secondary">Go to {query.data.total ? "last available page" : "first page"}</Link></div> : <>
            <div className="directory-results-heading"><p role="status">{query.data.total ? `${state.start}–${state.end} of ${query.data.total} ${filtered ? "matching " : ""}records` : "0 records"}</p><span>{query.isFetching ? "Refreshing…" : attentionQueueOrderLabel(kind, filters.sort)}</span></div>
            {query.data.data.length ? <AttentionQueueList kind={kind} records={query.data.data} canRecord={query.data.canRecord} busy={mutation.isPending || query.isFetching} onRecord={record} /> : <div className="directory-message"><h2>{filtered ? "No matching records" : kind === "prayers" ? "No requests awaiting prayer" : "No visits awaiting welcome"}</h2><p>{filtered ? "Try another search, date range, or status." : "Use All records to review previous follow-up."}</p>{filtered ? <button type="button" onClick={reset} className="record-button record-button-secondary">Reset queue</button> : <Link href={attentionQueueHref(kind, { ...filters, page: 1, status: "all" })} scroll={false} className="record-button record-button-secondary">All records</Link>}</div>}
            <ManagementPager page={filters.page} total={query.data.total} limit={query.data.limit} label={info.title + " pages"} hrefForPage={(page) => attentionQueueHref(kind, { ...filters, page })} />
          </>}
        </>}
      </div>
    </>}
  </section>;
}
