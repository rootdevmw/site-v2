"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getAuditEntity } from "@/config/audit-entities";
import { useAuditList } from "@/lib/hooks/useAccessLists";
import { directoryPageState } from "@/lib/utils/directory-records";
import { auditFilterError, auditHref, auditParams, readAuditFilters } from "@/lib/utils/access-lists";
import { DirectoryError, DirectoryLoading, ManagementPager } from "./DirectoryList";
import { AuditFilters } from "./AuditFilters";
import { AuditList } from "./AuditList";

export function AuditClient() {
  const { entity } = useParams<{ entity: string }>();
  const context = getAuditEntity(entity);
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["ADMIN"]);
  const params = useSearchParams();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [resetVersion, setResetVersion] = useState(0);
  const filters = readAuditFilters(params);
  const filterError = auditFilterError(filters);
  const query = useAuditList(context.key, filters, permitted && !filterError);
  const filtered = !!auditParams(filters, false).size;
  const state = query.data ? directoryPageState(filters.page, query.data.total, query.data.limit) : null;
  const filterKey = auditHref(context.key, filters);
  const previousFilters = useRef(filterKey);
  const results = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (previousFilters.current === filterKey || (query.isPending && !filterError) || navigating) return;
    previousFilters.current = filterKey;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "start" });
  }, [filterKey, query.isPending, filterError, navigating]);

  return <section className="record-page directory-page" aria-labelledby="audit-title">
    <header className="directory-header"><div><Link href="/dashboard/audit" className="record-back">← All history categories</Link><p className="record-eyebrow">Church records · History</p><h1 id="audit-title" className="record-title">{context.label} history</h1><p className="record-description">Trace recorded actions and open a record’s timeline to compare its snapshots.</p><p className="directory-caption">Dates and times in Malawi (CAT).</p></div></header>
    {!permitted ? <DirectoryError noun="history" error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} /> : <>
      <AuditFilters key={filterKey + ":" + resetVersion} filters={filters} pending={navigating} onApply={(next) => startTransition(() => router.push(auditHref(context.key, next), { scroll: false }))} onReset={() => { setResetVersion((version) => version + 1); startTransition(() => router.push("/dashboard/audit/" + encodeURIComponent(context.key), { scroll: false })); }} />
      {filtered && <p className="directory-applied">Applied filters: {filters.search && <span>Record ID contains “{filters.search}”</span>}{filters.action && <span>Action contains “{filters.action}”</span>}{filters.actorId && <span>Actor #{filters.actorId}</span>}{filters.from && <span>From {filters.from}</span>}{filters.to && <span>Through {filters.to}</span>}</p>}
      <div ref={results} tabIndex={-1} role="region" aria-label={context.label + " history results"} aria-busy={!filterError && (query.isFetching || navigating)}>
        {filterError ? <div className="directory-message" role="alert"><h2>Check your filters</h2><p>{filterError} Update the choices above or clear the filters.</p></div> : query.isPending || navigating ? <DirectoryLoading label="Loading history…" /> : query.isError ? <DirectoryError noun="history" error={query.error} onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : query.data && state && <>
          {state.outOfRange ? <div className="directory-message"><h2>This page is no longer available</h2><p>Recorded history may have changed. Your filters are preserved.</p><Link href={auditHref(context.key, { ...filters, page: state.totalPages })} scroll={false} className="record-button record-button-secondary">Go to {query.data.total ? "last available page" : "first page"}</Link></div> : <>
            <div className="directory-results-heading"><p role="status">{query.data.total ? `${state.start}–${state.end} of ${query.data.total} ${filtered ? "matching " : ""}entries` : "0 entries"}</p><span>{query.isFetching ? "Refreshing…" : "Newest first"}</span></div>
            {query.data.data.length ? <AuditList entries={query.data.data} /> : <div className="directory-message"><h2>{filtered ? "No matching history" : "No recorded history yet"}</h2><p>{filtered ? "Try another record ID, action, actor, or date range." : "This category has no recorded entries. History does not confirm whether the underlying records exist."}</p><Link href={filtered ? "/dashboard/audit/" + encodeURIComponent(context.key) : "/dashboard/audit"} scroll={false} className="record-button record-button-secondary">{filtered ? "Clear filters" : "Browse other categories"}</Link></div>}
            <ManagementPager page={filters.page} total={query.data.total} limit={query.data.limit} label={context.label + " history pages"} hrefForPage={(page) => auditHref(context.key, { ...filters, page })} />
          </>}
        </>}
      </div>
    </>}
  </section>;
}
