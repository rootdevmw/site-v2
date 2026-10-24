"use client";

import { useState } from "react";
import { attentionQueueFilterError, attentionQueueInfo, queueStatuses, type AttentionQueueFilters as Filters, type AttentionQueueKind } from "@/lib/utils/attention-queues";

export function AttentionQueueFilters({ kind, filters, pending, onApply, onReset }: { kind: AttentionQueueKind; filters: Filters; pending: boolean; onApply: (filters: Filters) => void; onReset: () => void }) {
  const [error, setError] = useState("");
  const info = attentionQueueInfo[kind];
  const statuses = queueStatuses(kind);
  return <form className="directory-filters" aria-label="Filter follow-up queue" onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = { page: 1, search: String(data.get("search") || "").trim(), status: String(data.get("status") || "open"), urgent: String(data.get("urgent") || ""), from: String(data.get("from") || ""), to: String(data.get("to") || ""), sort: String(data.get("sort") || info.defaultSort) };
    const failure = attentionQueueFilterError(kind, next);
    setError(failure);
    if (!failure) onApply(next);
  }}>
    <div className="directory-filter directory-search"><label htmlFor="queue-search">{kind === "prayers" ? "Name or prayer subject" : "Name, phone, or email"}</label><input id="queue-search" name="search" type="search" className="record-input" defaultValue={filters.search} maxLength={200} placeholder="Find a record…" /></div>
    <div className="directory-filter"><label htmlFor="queue-status">Follow-up status</label><select id="queue-status" name="status" className="record-input" defaultValue={filters.status}>{!statuses.some(({ value }) => value === filters.status) && <option value={filters.status}>Choose a valid status</option>}{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div>
    {kind === "prayers" && <div className="directory-filter"><label htmlFor="queue-urgent">Urgency</label><select id="queue-urgent" name="urgent" className="record-input" defaultValue={filters.urgent}><option value="">All requests</option><option value="true">Urgent</option><option value="false">Not marked urgent</option></select></div>}
    <div className="directory-filter"><label htmlFor="queue-from">{info.dateLabel} from</label><input id="queue-from" name="from" type="date" className="record-input" defaultValue={filters.from} aria-describedby="queue-date-help" /></div>
    <div className="directory-filter"><label htmlFor="queue-to">{info.dateLabel} through</label><input id="queue-to" name="to" type="date" className="record-input" defaultValue={filters.to} aria-describedby="queue-date-help" /></div>
    <div className="directory-filter"><label htmlFor="queue-sort">Order</label><select id="queue-sort" name="sort" className="record-input" defaultValue={filters.sort}>{kind === "prayers" && <option value="priority">Urgent first, then oldest</option>}<option value="oldest">{kind === "prayers" ? "Oldest received first" : "Earliest visit dates first"}</option><option value="newest">{kind === "prayers" ? "Newest received first" : "Latest visit dates first"}</option></select></div>
    <div className="directory-filter-actions"><button type="submit" disabled={pending} className="record-button record-button-primary">{pending ? "Applying…" : "Apply filters"}</button><button type="button" disabled={pending} onClick={onReset} className="record-button record-button-secondary">Reset queue</button></div>
    <p id="queue-date-help" className="directory-caption access-filter-note">Dates include the full calendar day in Malawi (CAT).</p>{error && <p role="alert" className="schedule-filter-error">{error}</p>}
  </form>;
}
