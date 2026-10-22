"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useAccessList, useDeleteAccessRecord } from "@/lib/hooks/useAccessLists";
import { directoryPageState } from "@/lib/utils/directory-records";
import { accessHref, accessInfo, accessParams, readAccessFilters, type AccessKind } from "@/lib/utils/access-lists";
import { DirectoryError, DirectoryLoading, ManagementPager } from "./DirectoryList";
import { AccessFilters } from "./AccessFilters";
import { AccessList } from "./AccessList";

export function AccessClient({ kind }: { kind: AccessKind }) {
  const actor = useAuthStore((state) => state.user);
  const info = accessInfo[kind];
  const permitted = hasRequiredRole(actor?.roles ?? [], [info.requiredRole]);
  const params = useSearchParams();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [resetVersion, setResetVersion] = useState(0);
  const filters = readAccessFilters(kind, params);
  const query = useAccessList(kind, filters, permitted);
  const deletion = useDeleteAccessRecord(kind);
  const filtered = !!accessParams(kind, filters, false).size;
  const state = query.data ? directoryPageState(filters.page, query.data.total, query.data.limit) : null;
  const filterKey = accessHref(kind, filters);
  const previousFilters = useRef(filterKey);
  const results = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (previousFilters.current === filterKey || query.isPending || navigating) return;
    previousFilters.current = filterKey;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "start" });
  }, [filterKey, query.isPending, navigating]);

  return <section className="record-page directory-page" aria-labelledby="access-title">
    <header className="directory-header"><div><p className="record-eyebrow">People &amp; access</p><h1 id="access-title" className="record-title">{info.title}</h1><p className="record-description">{info.description}</p></div>{permitted && <div className="directory-header-actions"><Link href={"/dashboard/" + kind + "/new"} className="record-button record-button-primary">Add {info.singular}</Link><Link href="/dashboard/audit" className="record-button record-button-secondary">Browse history</Link></div>}</header>
    {!permitted ? <DirectoryError noun="list" error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} /> : <>
      <AccessFilters key={filterKey + ":" + resetVersion} kind={kind} filters={filters} pending={navigating} onApply={(next) => startTransition(() => router.push(accessHref(kind, next), { scroll: false }))} onReset={() => { setResetVersion((version) => version + 1); startTransition(() => router.push("/dashboard/" + kind, { scroll: false })); }} />
      {filtered && <p className="directory-applied">Applied filters: {filters.search && <span>Search “{filters.search}”</span>}{filters.role && <span>Recorded role: {filters.role}</span>}{filters.linked && <span>{filters.linked === "true" ? "Linked profiles" : "No linked profile"}</span>}</p>}
      {kind === "users" ? <Link href={accessHref(kind, { ...filters, page: 1, linked: "false" })} scroll={false} className="directory-text-link">Show accounts without a profile</Link> : <p className="directory-caption">Navigation summaries describe the configured hierarchy. Individual actions also depend on server permission checks.</p>}
      {deletion.isSuccess && <p role="status" className="directory-notice">Deletion confirmed. The list has been refreshed.</p>}{deletion.isError && <p role="alert" className="directory-notice">Deletion could not be confirmed. Review the refreshed list before trying again; related records may prevent deletion.</p>}
      <div ref={results} tabIndex={-1} role="region" aria-label={info.title + " search results"} aria-busy={query.isFetching || navigating}>
        {query.isPending || navigating ? <DirectoryLoading label={"Loading " + kind + "…"} /> : query.isError ? <DirectoryError noun="list" error={query.error} onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : query.data && state && <>
          {state.outOfRange ? <div className="directory-message"><h2>This page is no longer available</h2><p>The results may have changed. Your filters are preserved.</p><Link href={accessHref(kind, { ...filters, page: state.totalPages })} scroll={false} className="record-button record-button-secondary">Go to {query.data.total ? "last available page" : "first page"}</Link></div> : <>
            <div className="directory-results-heading"><p role="status">{query.data.total ? `${state.start}–${state.end} of ${query.data.total} ${filtered ? "matching " : ""}${kind}` : "0 results"}</p><span>{query.isFetching ? "Refreshing…" : kind === "users" ? "Newest accounts first" : "Role name A–Z"}</span></div>
            {query.data.data.length ? <AccessList kind={kind} records={query.data.data} actorId={actor?.id} busy={deletion.isPending || query.isFetching} onDelete={(id) => deletion.mutateAsync(id)} /> : <div className="directory-message"><h2>{filtered ? "No matching " + kind : "No " + kind + " yet"}</h2><p>{filtered ? "Try another name or change your filter choices." : "Add a " + info.singular + " to get started."}</p><Link href={"/dashboard/" + kind + (filtered ? "" : "/new")} scroll={false} className="record-button record-button-secondary">{filtered ? "Clear filters" : "Add " + info.singular}</Link></div>}
            <ManagementPager page={filters.page} total={query.data.total} limit={query.data.limit} label={info.title + " pages"} hrefForPage={(page) => accessHref(kind, { ...filters, page })} />
          </>}
        </>}
      </div>
    </>}
  </section>;
}
