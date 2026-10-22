"use client";

import Link from "next/link";
import { getRecordFailure } from "@/lib/utils/record-details";

export type ManagementOptionsQuery = { data?: { id: string; name: string }[]; isPending: boolean; isError: boolean; isFetching: boolean; error: unknown; refetch: () => unknown };

export function ManagementOptionFilter({ id, name, label, value, query, allLabel }: { id: string; name: string; label: string; value: string; query: ManagementOptionsQuery; allLabel?: string }) {
  const options = query.data ?? [];
  const failure = getRecordFailure(query.error);
  return <div className="directory-filter"><label htmlFor={id}>{label}</label>
    <select id={id} name={name} className="record-input" defaultValue={value} aria-describedby={query.isPending || query.isError ? id + "-feedback" : undefined} aria-busy={query.isFetching}>
      <option value="">{allLabel || (label === "Homecell" ? "All homecells and church-wide" : "All types")}</option>
      {value && !options.some((option) => option.id === value) && <option value={value}>Selected {label.toLowerCase()} #{value}</option>}
      {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
    </select>
    {query.isPending && <p id={id + "-feedback"} role="status" className="directory-caption">Loading {label.toLowerCase()} choices…</p>}
    {query.isError && <div id={id + "-feedback"} className="directory-caption" role="alert"><p>{failure === "session" ? "Sign in again to load these choices." : failure === "forbidden" ? "These choices are unavailable to your account." : "Choices could not be refreshed. Your selected filter is kept."}</p>{failure === "error" && <button type="button" disabled={query.isFetching} className="directory-text-link" onClick={() => { void query.refetch(); }}>Retry {label.toLowerCase()} choices</button>}{failure === "session" && <Link href="/login" className="directory-text-link">Sign in</Link>}</div>}
  </div>;
}
