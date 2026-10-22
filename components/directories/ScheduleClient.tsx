"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useDeleteScheduleRecord, useScheduleHomecells, useScheduleList, useScheduleTypes } from "@/lib/hooks/useScheduleLists";
import { getChurchDateInputValue } from "@/lib/utils/church-date";
import { directoryPageState } from "@/lib/utils/directory-records";
import { readScheduleFilters, scheduleFilterError, scheduleHref, scheduleInfo, scheduleOrderLabel, scheduleParams, type ScheduleKind } from "@/lib/utils/schedule-lists";
import { DirectoryError, DirectoryLoading, ManagementPager } from "./DirectoryList";
import { ScheduleFilters } from "./ScheduleFilters";
import { ScheduleList } from "./ScheduleList";

export function ScheduleClient({ kind }: { kind: ScheduleKind }) {
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const params = useSearchParams();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [resetVersion, setResetVersion] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const filters = readScheduleFilters(kind, params);
  const issue = scheduleFilterError(filters);
  const query = useScheduleList(kind, filters, permitted);
  const types = useScheduleTypes(kind, permitted);
  const homecells = useScheduleHomecells(permitted && kind !== "events");
  const deletion = useDeleteScheduleRecord(kind);
  const info = scheduleInfo[kind];
  const filtered = !!scheduleParams(kind, filters, false).size;
  const state = query.data ? directoryPageState(filters.page, query.data.total, query.data.limit) : null;
  const filterKey = scheduleHref(kind, filters);
  const previousFilters = useRef(filterKey);
  const results = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (previousFilters.current === filterKey || (query.isPending && !issue) || navigating) return;
    previousFilters.current = filterKey;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "start" });
  }, [filterKey, query.isPending, issue, navigating]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const today = getChurchDateInputValue(now);
  const typeName = types.data?.find((type) => type.id === filters.typeId)?.name || "#" + filters.typeId;
  const homecellName = homecells.data?.find((homecell) => homecell.id === filters.homecellId)?.name || "#" + filters.homecellId;

  return <section className="record-page directory-page" aria-labelledby="schedule-title">
    <header className="directory-header"><div><p className="record-eyebrow">Gatherings &amp; planning</p><h1 id="schedule-title" className="record-title">{info.title}</h1><p className="record-description">{info.description}</p>{kind !== "program-templates" && <p className="directory-caption">{kind === "events" ? "Dates and times" : "Calendar dates"} in Malawi (CAT).</p>}</div>
      {permitted && <div className="directory-header-actions"><Link href={"/dashboard/" + kind + "/new"} className="record-button record-button-primary">Add {info.singular}</Link>{kind !== "events" && <Link href={kind === "programs" ? "/dashboard/program-templates" : "/dashboard/programs"} className="record-button record-button-secondary">{kind === "programs" ? "Browse templates" : "View programs"}</Link>}</div>}
    </header>
    {permitted && kind !== "events" && <Link href="/dashboard/program-types" className="directory-text-link">Manage program types</Link>}
    {!permitted ? <DirectoryError error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} noun="list" /> : <>
      <ScheduleFilters key={filterKey + ":" + resetVersion} kind={kind} filters={filters} types={types} homecells={homecells} pending={navigating} onApply={(next) => startTransition(() => router.push(scheduleHref(kind, next), { scroll: false }))} onReset={() => { setResetVersion((version) => version + 1); startTransition(() => router.push("/dashboard/" + kind, { scroll: false })); }} />
      {filtered && <p className="directory-applied">Applied filters: {filters.search && <span>Search “{filters.search}”</span>}{filters.typeId && <span>Type: {typeName}</span>}{filters.homecellId && <Link href={"/dashboard/homecells/" + filters.homecellId}>Homecell: {homecellName}</Link>}{filters.startDate && <span>Starts from {filters.startDate}</span>}{filters.endDate && <span>Starts through {filters.endDate}</span>}{filters.date && <span>On {filters.date}</span>}{filters.fromDate && <span>From {filters.fromDate} onward</span>}</p>}
      {kind !== "program-templates" && <div className="mt-2"><Link href={scheduleHref(kind, { ...filters, page: 1, ...(kind === "events" ? { startDate: today, endDate: "" } : { date: "", fromDate: today }) })} scroll={false} className="directory-text-link">{kind === "events" ? "Starting today onward" : "Today onward"}</Link></div>}
      {deletion.isSuccess && <p role="status" className="directory-notice">Deletion confirmed. The list has been refreshed.</p>}
      {deletion.isError && <p role="alert" className="directory-notice">Deletion could not be confirmed. Review the refreshed list before trying again; related records may prevent deletion.</p>}
      <div ref={results} tabIndex={-1} role="region" aria-label={info.title + " search results"} aria-busy={query.isFetching || navigating}>
        {issue ? <div className="directory-message" role="alert"><h2>Check your date filters</h2><p>{issue} Correct the filters above or use Reset to see all records.</p></div> : query.isPending || navigating ? <DirectoryLoading label={"Loading " + info.title.toLowerCase() + "…"} /> : query.isError ? <DirectoryError noun="list" error={query.error} onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : query.data && state && <>
          {state.outOfRange ? <div className="directory-message"><h2>This page is no longer available</h2><p>The results may have changed. Your filters are preserved.</p><Link href={scheduleHref(kind, { ...filters, page: state.totalPages })} scroll={false} className="record-button record-button-secondary">Go to {query.data.total ? "last available page" : "first page"}</Link></div> : <>
            <div className="directory-results-heading"><p role="status">{query.data.total ? `${state.start}–${state.end} of ${query.data.total} ${filtered ? "matching " : ""}${info.title.toLowerCase()}` : "0 results"}</p><span>{query.isFetching ? "Refreshing…" : scheduleOrderLabel(kind, filters)}</span></div>
            {query.data.data.length ? <ScheduleList kind={kind} records={query.data.data} now={now} onDelete={(id) => deletion.mutateAsync(id)} busy={deletion.isPending} /> : <div className="directory-message"><h2>{filtered ? "No matching " + info.title.toLowerCase() : "No " + info.title.toLowerCase() + " yet"}</h2><p>{filtered ? "Try different dates or choices, or clear your filters to see all records." : "Add a " + info.singular + " to start planning."}</p><Link href={"/dashboard/" + kind + (filtered ? "" : "/new")} scroll={false} className="record-button record-button-secondary">{filtered ? "Clear filters" : "Add " + info.singular}</Link></div>}
            <ManagementPager page={filters.page} total={query.data.total} limit={query.data.limit} label={info.title + " pages"} hrefForPage={(page) => scheduleHref(kind, { ...filters, page })} />
          </>}
        </>}
      </div>
    </>}
  </section>;
}
