"use client";

import { useState } from "react";
import { auditFilterError, type AuditFilters as Filters } from "@/lib/utils/access-lists";

export function AuditFilters({ filters, pending, onApply, onReset }: { filters: Filters; pending: boolean; onApply: (filters: Filters) => void; onReset: () => void }) {
  const [error, setError] = useState("");
  return <form className="directory-filters" aria-label="Filter history" onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = { page: 1, search: String(data.get("search") || "").trim(), action: String(data.get("action") || "").trim(), actorId: String(data.get("actorId") || "").trim(), from: String(data.get("from") || ""), to: String(data.get("to") || "") };
    const failure = auditFilterError(next);
    setError(failure);
    if (!failure) onApply(next);
  }}>
    <div className="directory-filter"><label htmlFor="audit-record">Record ID contains</label><input id="audit-record" name="search" type="search" defaultValue={filters.search} className="record-input" placeholder="e.g. 24" /></div>
    <div className="directory-filter"><label htmlFor="audit-action">Action contains</label><input id="audit-action" name="action" type="search" defaultValue={filters.action} className="record-input" placeholder="e.g. updated, login, role" aria-describedby="audit-action-help" /><p id="audit-action-help" className="directory-caption">Matches recorded action names.</p></div>
    <div className="directory-filter"><label htmlFor="audit-actor">Actor account ID</label><input id="audit-actor" name="actorId" inputMode="numeric" pattern="[1-9][0-9]*" defaultValue={filters.actorId} className="record-input" placeholder="e.g. 12" /></div>
    <div className="directory-filter"><label htmlFor="audit-from">From date</label><input id="audit-from" name="from" type="date" defaultValue={filters.from} className="record-input" aria-describedby="audit-date-help" /></div>
    <div className="directory-filter"><label htmlFor="audit-to">Through date</label><input id="audit-to" name="to" type="date" defaultValue={filters.to} className="record-input" aria-describedby="audit-date-help" /></div>
    <div className="directory-filter-actions"><button type="submit" disabled={pending} className="record-button record-button-primary">{pending ? "Applying…" : "Apply filters"}</button><button type="button" disabled={pending} onClick={onReset} className="record-button record-button-secondary">Clear filters</button></div>
    <p id="audit-date-help" className="directory-caption access-filter-note">Dates include the whole calendar day in Malawi (CAT).</p>
    {error && <p role="alert" className="schedule-filter-error">{error}</p>}
  </form>;
}
