"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useDeleteEditorialRecord, useEditorialList, useEditorialOptions } from "@/lib/hooks/useEditorialLists";
import { directoryPageState } from "@/lib/utils/directory-records";
import { editorialHref, editorialInfo, editorialParams, readEditorialFilters, type EditorialKind } from "@/lib/utils/editorial-lists";
import { DirectoryError, DirectoryLoading, ManagementPager } from "./DirectoryList";
import { EditorialFilters } from "./EditorialFilters";
import { EditorialList } from "./EditorialList";

export function EditorialClient({ kind }: { kind: EditorialKind }) {
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["MEDIA"]);
  const params = useSearchParams();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [resetVersion, setResetVersion] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const filters = readEditorialFilters(kind, params);
  const query = useEditorialList(kind, filters, permitted);
  const choices = useEditorialOptions(kind, permitted);
  const deletion = useDeleteEditorialRecord(kind);
  const info = editorialInfo[kind];
  const filtered = !!editorialParams(kind, filters, false).size;
  const state = query.data ? directoryPageState(filters.page, query.data.total, query.data.limit) : null;
  const filterKey = editorialHref(kind, filters);
  const previousFilters = useRef(filterKey);
  const results = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (previousFilters.current === filterKey || query.isPending || navigating) return;
    previousFilters.current = filterKey;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "start" });
  }, [filterKey, query.isPending, navigating]);
  useEffect(() => {
    if (kind !== "streams") return;
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, [kind]);
  const optionId = kind === "content" ? filters.typeId : filters.platformId;
  const optionName = choices.data?.find((choice) => choice.id === optionId)?.name || "#" + optionId;

  return <section className="record-page directory-page" aria-labelledby="editorial-title">
    <header className="directory-header"><div><p className="record-eyebrow">Messages &amp; media</p><h1 id="editorial-title" className="record-title">{info.title}</h1><p className="record-description">{info.description}</p>{kind !== "content" && <p className="directory-caption">Dates and times in Malawi (CAT).</p>}</div>{permitted && <div className="directory-header-actions"><Link href={"/dashboard/" + kind + "/new"} className="record-button record-button-primary">Add {info.singular}</Link><Link href={kind === "streams" ? "/live" : "/" + kind} className="record-button record-button-secondary">{kind === "streams" ? "Watch online" : kind === "content" ? "Public messages" : "Public publications"}</Link></div>}</header>
    {permitted && kind === "content" && <Link href="/dashboard/content-types" className="directory-text-link">Manage content types</Link>}
    {!permitted ? <DirectoryError noun="list" error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} /> : <>
      <EditorialFilters key={filterKey + ":" + resetVersion} kind={kind} filters={filters} choices={choices} pending={navigating} onApply={(next) => startTransition(() => router.push(editorialHref(kind, next), { scroll: false }))} onReset={() => { setResetVersion((version) => version + 1); startTransition(() => router.push("/dashboard/" + kind, { scroll: false })); }} />
      {filtered && <p className="directory-applied">Applied filters: {filters.search && <span>Search “{filters.search}”</span>}{filters.status && <span>Status: {filters.status}</span>}{optionId && <span>{kind === "content" ? "Type" : "Platform"}: {optionName}</span>}{filters.isLive && <span>{filters.isLive === "true" ? "Selected live" : "Not selected live"}</span>}</p>}
      <div className="mt-2"><Link href={editorialHref(kind, { ...filters, page: 1, ...(kind === "streams" ? { isLive: "true" } : { status: "Draft" }) })} scroll={false} className="directory-text-link">{kind === "streams" ? "Show selected live" : "Show drafts"}</Link></div>
      {deletion.isSuccess && <p role="status" className="directory-notice">Deletion confirmed. The list has been refreshed.</p>}{deletion.isError && <p role="alert" className="directory-notice">Deletion could not be confirmed. Review the refreshed list before trying again; related records may prevent deletion.</p>}
      <div ref={results} tabIndex={-1} role="region" aria-label={info.title + " search results"} aria-busy={query.isFetching || navigating}>
        {query.isPending || navigating ? <DirectoryLoading label={"Loading " + info.resultLabel + "…"} /> : query.isError ? <DirectoryError noun="list" error={query.error} onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : query.data && state && <>
          {state.outOfRange ? <div className="directory-message"><h2>This page is no longer available</h2><p>The results may have changed. Your filters are preserved.</p><Link href={editorialHref(kind, { ...filters, page: state.totalPages })} scroll={false} className="record-button record-button-secondary">Go to {query.data.total ? "last available page" : "first page"}</Link></div> : <>
            <div className="directory-results-heading"><p role="status">{query.data.total ? `${state.start}–${state.end} of ${query.data.total} ${filtered ? "matching " : ""}${info.resultLabel}` : "0 results"}</p><span>{query.isFetching ? "Refreshing…" : "Newest added first"}</span></div>
            {query.data.data.length ? <EditorialList kind={kind} records={query.data.data} now={now} onDelete={(id) => deletion.mutateAsync(id)} busy={deletion.isPending} authorLinkAllowed={hasRequiredRole(user?.roles ?? [], ["DEACON"])} /> : <div className="directory-message"><h2>{filtered ? "No matching " + info.resultLabel : "No " + info.resultLabel + " yet"}</h2><p>{filtered ? "Try different search terms or choices, or clear your filters to see all records." : "Add a " + info.singular + " to start preparing resources for the congregation."}</p><Link href={"/dashboard/" + kind + (filtered ? "" : "/new")} scroll={false} className="record-button record-button-secondary">{filtered ? "Clear filters" : "Add " + info.singular}</Link></div>}
            <ManagementPager page={filters.page} total={query.data.total} limit={query.data.limit} label={info.title + " pages"} hrefForPage={(page) => editorialHref(kind, { ...filters, page })} />
          </>}
        </>}
      </div>
    </>}
  </section>;
}
