"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { getRecordFailure } from "@/lib/utils/record-details";
import { formatChurchDate } from "@/lib/utils/church-date";

type PanelQuery = { isPending: boolean; isError: boolean; isFetching: boolean; error: unknown; refetch: () => unknown };
export function OverviewPanel({ title, description, query, generatedAt, children }: { title: string; description: string; query: PanelQuery; generatedAt?: string; children: ReactNode }) {
  const headingId = useId();
  const failure = getRecordFailure(query.error);
  return <section className="overview-panel" aria-labelledby={headingId} aria-busy={query.isFetching}>
    <header className="overview-panel-heading"><div><h2 id={headingId}>{title}</h2><p>{description}</p></div><button type="button" className="overview-refresh" aria-label={"Refresh " + title.toLowerCase()} disabled={query.isFetching || query.isPending || (query.isError && (failure === "session" || failure === "forbidden"))} onClick={() => { void query.refetch(); }}><FiRefreshCw aria-hidden="true" /></button></header>
    {query.isPending ? <div className="overview-loading" role="status">Loading {title.toLowerCase()}…<div aria-hidden="true" className="overview-loading-bars motion-safe:animate-pulse"><span /><span /></div></div> : query.isError ? <div className="overview-error" role="alert"><h3>{failure === "session" ? "Please sign in again" : failure === "forbidden" ? "Access unavailable" : "This summary is unavailable"}</h3><p>{failure === "session" ? "Your session may have expired. Sign in to refresh this information." : failure === "forbidden" ? "Your account no longer has permission to view this summary." : "The latest figures could not be confirmed. Other dashboard sections remain available."}</p>{failure === "session" ? <Link href="/login" className="record-button record-button-secondary">Sign in</Link> : failure !== "forbidden" && <button type="button" className="record-button record-button-secondary" disabled={query.isFetching} onClick={() => { void query.refetch(); }}>Try again</button>}</div> : <>{children}{generatedAt && <p className="overview-checked">{query.isFetching ? "Refreshing · last checked " : "Checked "}<time dateTime={generatedAt}>{formatChurchDate(generatedAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })} CAT</time></p>}</>}
  </section>;
}
