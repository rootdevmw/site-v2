"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useDeleteDirectoryRecord, useDirectoryRecords } from "@/lib/hooks/useDirectoryRecords";
import { directoryHref, directoryInfo, directoryPageState, directoryParams, readDirectoryFilters, type DirectoryKind } from "@/lib/utils/directory-records";
import { DirectoryFilters } from "./DirectoryFilters";
import { DirectoryError, DirectoryList, DirectoryLoading, DirectoryPager } from "./DirectoryList";
import { MemberDirectoryExport } from "./MemberDirectoryExport";

export function DirectoryClient({ kind }: { kind: DirectoryKind }) {
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const params = useSearchParams();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [resetVersion, setResetVersion] = useState(0);
  const filters = readDirectoryFilters(kind, params);
  const query = useDirectoryRecords(kind, filters, permitted);
  const deletion = useDeleteDirectoryRecord(kind);
  const info = directoryInfo[kind];
  const filtered = !!directoryParams(kind, filters, false).size;
  const state = query.data ? directoryPageState(filters.page, query.data.total, query.data.limit) : null;
  const filterKey = directoryHref(kind, filters);
  const previousFilters = useRef(filterKey);
  const results = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (previousFilters.current === filterKey || query.isPending || navigating) return;
    previousFilters.current = filterKey;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "start" });
  }, [filterKey, query.isPending, navigating]);

  return <section className="record-page directory-page" aria-labelledby="directory-title">
    <header className="directory-header"><div><p className="record-eyebrow">Church community</p><h1 id="directory-title" className="record-title">{info.title}</h1><p className="record-description">{info.description}</p></div>
      {permitted && <div className="directory-header-actions"><Link href={"/dashboard/" + kind + "/new"} className="record-button record-button-primary">Add {info.singular}</Link>{kind === "members" && <MemberDirectoryExport filters={filters} />}</div>}
    </header>
    {!permitted ? <DirectoryError error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} /> : <>
      <DirectoryFilters key={filterKey + ":" + resetVersion} kind={kind} filters={filters} pending={navigating} onApply={(next) => startTransition(() => router.push(directoryHref(kind, next), { scroll: false }))} onReset={() => { setResetVersion((version) => version + 1); startTransition(() => router.push("/dashboard/" + kind, { scroll: false })); }} />
      {filtered && <p className="directory-applied">Applied filters: {filters.search && <span>Search “{filters.search}”</span>}{filters.status && <span>Status: {filters.status.toLowerCase()}</span>}{filters.prefix && <span>Title: {filters.prefix.toLowerCase()}</span>}{filters.leaderId && <Link href={"/dashboard/members/" + filters.leaderId}>Leader profile #{filters.leaderId}</Link>}{filters.overseerId && <Link href={"/dashboard/members/" + filters.overseerId}>Overseer profile #{filters.overseerId}</Link>}</p>}
      {deletion.isSuccess && <p role="status" className="directory-notice">Deletion confirmed. The directory has been refreshed.</p>}
      {deletion.isError && <p role="alert" className="directory-notice">Deletion could not be confirmed. Review the refreshed list before trying again; related records may prevent deletion.</p>}
      <div ref={results} tabIndex={-1} role="region" aria-label={info.title + " search results"} aria-busy={query.isFetching || navigating}>
        {query.isPending || navigating ? <DirectoryLoading label={"Loading " + info.title.toLowerCase() + "…"} /> : query.isError ? <DirectoryError error={query.error} onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : query.data && state && <>
          {state.outOfRange ? <div className="directory-message"><h2>This page is no longer available</h2><p>The results may have changed since you last visited. Your filters are preserved.</p><Link href={directoryHref(kind, { ...filters, page: state.totalPages })} scroll={false} className="record-button record-button-secondary">Go to {query.data.total ? "last available page" : "first page"}</Link></div> : <>
            <div className="directory-results-heading"><p role="status">{query.data.total ? `${state.start}–${state.end} of ${query.data.total} ${filtered ? "matching " : ""}${info.title.toLowerCase()}` : "0 results"}</p><span>{query.isFetching ? "Refreshing…" : "Newest added first"}</span></div>
            {query.data.data.length ? <DirectoryList kind={kind} records={query.data.data} onDelete={(id) => deletion.mutateAsync(id)} busy={deletion.isPending} /> : <div className="directory-message"><h2>{filtered ? "No matching " + info.title.toLowerCase() : "Your " + info.title.toLowerCase() + " directory is empty"}</h2><p>{filtered ? "Try a different search or clear your filters to see all records." : "Add the first " + info.singular + " to start building this directory."}</p><Link href={"/dashboard/" + kind + (filtered ? "" : "/new")} scroll={false} className="record-button record-button-secondary">{filtered ? "Clear filters" : "Add " + info.singular}</Link></div>}
            <DirectoryPager kind={kind} filters={filters} total={query.data.total} limit={query.data.limit} />
          </>}
        </>}
      </div>
    </>}
  </section>;
}
