"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { useDeleteProgramType } from "@/app/modules/programs/hooks/useDeleteProgramType";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useTypeCatalog } from "@/lib/hooks/useTypeCatalog";
import { directoryPageState } from "@/lib/utils/directory-records";
import { catalogHref, catalogPage, catalogWriteError, readCatalogFilters, typeCatalogInfo, type CatalogType, type TypeCatalogKind } from "@/lib/utils/type-catalogs";
import { DirectoryError, DirectoryLoading, ManagementPager } from "./DirectoryList";
import { CatalogTypeDialog } from "./CatalogTypeDialog";
import { TypeCatalogList } from "./TypeCatalogList";

export function TypeCatalogClient({ kind }: { kind: TypeCatalogKind }) {
  const actor = useAuthStore((state) => state.user);
  const info = typeCatalogInfo[kind];
  const permitted = hasRequiredRole(actor?.roles ?? [], [info.role]);
  const params = useSearchParams();
  const filters = readCatalogFilters(params);
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const [resetVersion, setResetVersion] = useState(0);
  const [notice, setNotice] = useState("");
  const query = useTypeCatalog(kind, permitted);
  const deletion = useDeleteProgramType();
  const page = query.data ? catalogPage(query.data, filters) : null;
  const state = page ? directoryPageState(filters.page, page.total, page.limit) : null;
  const filterKey = catalogHref(kind, filters);
  const previousFilters = useRef(filterKey);
  const results = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (previousFilters.current === filterKey || query.isPending || navigating) return;
    previousFilters.current = filterKey;
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView({ block: "start" });
  }, [filterKey, query.isPending, navigating]);
  function saved(type: CatalogType) { deletion.reset(); setNotice(`Saved “${type.name}” (type #${type.id}). The catalog has been refreshed.` + (filters.search ? " Your search is still applied." : "")); }
  function clear() { setResetVersion((version) => version + 1); startTransition(() => router.push("/dashboard/" + info.path, { scroll: false })); }

  return <section className="record-page directory-page" aria-labelledby="catalog-title">
    <header className="directory-header"><div><p className="record-eyebrow">Church record categories</p><h1 id="catalog-title" className="record-title">{info.title}</h1><p className="record-description">{info.description}</p></div>{permitted && <div className="directory-header-actions"><CatalogTypeDialog kind={kind} onSaved={saved} busy={deletion.isPending} /><Link href={"/dashboard/" + kind} className="record-button record-button-secondary">{kind === "content" ? "All messages" : "All programs"}</Link></div>}</header>
    {!permitted ? <DirectoryError noun="catalog" error={{ response: { status: 403 } }} onRetry={() => {}} retrying={false} /> : <>
      <form key={filterKey + ":" + resetVersion} className="directory-filters" aria-label="Search type catalog" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); startTransition(() => router.push(catalogHref(kind, { page: 1, search: String(data.get("search") || "").trim() }), { scroll: false })); }}><div className="directory-filter directory-search"><label htmlFor="catalog-search">Type name</label><input id="catalog-search" name="search" type="search" defaultValue={filters.search} className="record-input" placeholder="Find a type…" /></div><div className="directory-filter-actions"><button type="submit" disabled={navigating} className="record-button record-button-primary">Apply search</button><button type="button" disabled={navigating} onClick={clear} className="record-button record-button-secondary">Clear search</button></div></form>
      {filters.search && <p className="directory-applied">Applied search: <span>“{filters.search}”</span></p>}
      {notice && <p role="status" className="directory-notice">{notice}</p>}
      {deletion.isSuccess && <p role="status" className="directory-notice">Type deleted. The catalog has been refreshed.</p>}{deletion.isError && <p role="alert" className="directory-notice">{catalogWriteError(deletion.error, "delete")}</p>}
      <div ref={results} tabIndex={-1} role="region" aria-label={info.title + " search results"} aria-busy={query.isFetching || navigating}>
        {query.isPending || navigating ? <DirectoryLoading label="Loading type catalog…" /> : query.isError ? <DirectoryError noun="catalog" error={query.error} onRetry={() => { void query.refetch(); }} retrying={query.isFetching} /> : page && state && <>
          {state.outOfRange ? <div className="directory-message"><h2>This page is no longer available</h2><p>The catalog may have changed. Your search is preserved.</p><Link href={catalogHref(kind, { ...filters, page: state.totalPages })} scroll={false} className="record-button record-button-secondary">Go to {page.total ? "last available page" : "first page"}</Link></div> : <>
            <div className="directory-results-heading"><p role="status">{page.total ? `${state.start}–${state.end} of ${page.total} ${filters.search ? "matching " : ""}types` : "0 types"}</p><span>{query.isFetching ? "Refreshing…" : "Type name A–Z"}</span></div>
            {page.data.length ? <TypeCatalogList kind={kind} records={page.data} canViewHistory={hasRequiredRole(actor?.roles ?? [], ["ADMIN"])} onSaved={saved} onDelete={async (id) => { setNotice(""); await deletion.mutateAsync(id); }} busy={deletion.isPending || query.isFetching} /> : <div className="directory-message"><h2>{filters.search ? "No matching types" : "No types yet"}</h2><p>{filters.search ? "Try another name or clear the search to see the whole catalog." : "Add a type to start organizing your church records."}</p>{filters.search ? <button type="button" onClick={clear} className="record-button record-button-secondary">Clear search</button> : <CatalogTypeDialog kind={kind} onSaved={saved} />}</div>}
            <ManagementPager page={filters.page} total={page.total} limit={page.limit} label={info.title + " pages"} hrefForPage={(page) => catalogHref(kind, { ...filters, page })} />
          </>}
        </>}
      </div>
    </>}
  </section>;
}
