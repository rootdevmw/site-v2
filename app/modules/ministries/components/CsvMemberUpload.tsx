"use client";

import { useId, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiUpload } from "react-icons/fi";
import { getMemberDirectory } from "@/lib/api/group-records";
import { parseMemberCsv, matchMemberCsv, type MemberCsvRow } from "@/lib/utils/ministry-import";
import { retryRecordRequest } from "@/lib/utils/record-details";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";
import { useBulkAssignMembers } from "../hooks/useBulkAssignMembers";

export function CsvMemberUpload({ ministryId, assignedIds, disabled = false }: {
  ministryId: string; assignedIds: Set<string>; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" onClick={() => setOpen(true)} disabled={disabled} className="record-button record-button-secondary"><FiUpload aria-hidden="true" />Import CSV</button>
    {open && <ImportDialog ministryId={ministryId} assignedIds={assignedIds} onClose={() => setOpen(false)} />}
  </>;
}

function ImportDialog({ ministryId, assignedIds, onClose }: { ministryId: string; assignedIds: Set<string>; onClose: () => void }) {
  const inputId = useId();
  const fileVersion = useRef(0);
  const [rows, setRows] = useState<MemberCsvRow[]>([]);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const bulk = useBulkAssignMembers();
  const directory = useQuery({
    queryKey: ["members", "csv-directory"],
    queryFn: ({ signal }) => getMemberDirectory(signal),
    retry: retryRecordRequest,
  });
  const matches = useMemo(() => matchMemberCsv(rows, directory.data ?? [], assignedIds), [rows, directory.data, assignedIds]);
  const ready = matches.filter((match) => match.state === "ready" && match.member);
  const labels = { ready: "Ready", assigned: "Already assigned", duplicate: "Duplicate row", ambiguous: "Ambiguous name", missing: "Not found" };
  const busy = bulk.isPending;

  async function readFile(file?: File) {
    if (!file || busy) return;
    const version = ++fileVersion.current;
    setReading(true);
    setError("");
    setRows([]);
    try {
      const parsed = parseMemberCsv(await file.text());
      if (version !== fileVersion.current) return;
      setRows(parsed);
      if (!parsed.length) setError("No member rows were found in this file.");
    } catch (failure) {
      if (version === fileVersion.current) setError(failure instanceof Error ? failure.message : "The file could not be read.");
    } finally {
      if (version === fileVersion.current) setReading(false);
    }
  }

  async function importMembers() {
    if (busy || !ready.length || directory.isFetching || directory.isError) return;
    setError("");
    try {
      const result = await bulk.mutateAsync({ ministryId, memberIds: ready.map((match) => match.member!.id) });
      if (!result.failedIds.length) onClose();
      else setError(result.assignedIds.length + " assigned; " + result.failedIds.length + " could not be confirmed. Membership has been refreshed. Retry the remaining ready rows when the connection is available.");
    } catch {
      setError("The import could not be confirmed. Refresh the membership before trying again.");
    }
  }

  return <Dialog open onClose={onClose} closeDisabled={busy} title="Import ministry members" description="Match firstName and lastName columns against the complete church directory.">
    <div onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void readFile(event.dataTransfer.files[0]); }} className={"rounded-xl border-2 border-dashed p-5 " + (dragging ? "border-[var(--brand-link)] bg-[var(--brand-soft)]" : "border-[#d9d0c3]")}>
      <label htmlFor={inputId} className="block text-sm font-semibold">Choose a CSV file or drop it here</label>
      <input id={inputId} type="file" accept=".csv,text/csv" disabled={busy} onChange={(event: ChangeEvent<HTMLInputElement>) => { void readFile(event.target.files?.[0]); }} className="mt-3 block min-h-11 w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border file:border-[#d9d0c3] file:bg-white file:px-3 file:py-2" />
      <p className="mt-3 text-xs leading-6 text-[#6c6257]">Preview the matches before importing. People with the same name must be added individually; duplicate rows are skipped.</p>
    </div>
    {(directory.isFetching || reading) && <p role="status" className="record-empty mt-5">{reading ? "Reading CSV…" : "Loading the complete member directory…"}</p>}
    {directory.isError && <div role="alert" className="mt-5"><p className="record-empty">The complete directory could not be loaded. Import is unavailable until it can be verified.</p><button type="button" onClick={() => { void directory.refetch(); }} className="record-button record-button-secondary mt-3">Retry directory</button></div>}
    {!directory.isPending && !directory.isError && !reading && matches.length > 0 && <div className="mt-5">
      <p className="mb-3 text-sm font-semibold">{ready.length} of {matches.length} rows ready to import</p>
      <div role="region" aria-label="CSV member matches" tabIndex={0} className="max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-[#e7e0d5]">
        {matches.map((match, index) => <div key={index} className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e7e0d5] p-3 last:border-0">
          <span className="min-w-0 flex-1 text-sm wrap-anywhere">{match.firstName} {match.lastName}</span>
          <span className={"text-xs font-semibold " + (match.state === "ready" ? "text-[#365c29]" : match.state === "assigned" || match.state === "duplicate" ? "text-[#6c6257]" : "text-[#8a4817]")}>{labels[match.state]}</span>
        </div>)}
      </div>
    </div>}
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-7 text-red-900">{error}</p>}
    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#e7e0d5] pt-5">
      <button type="button" disabled={busy} onClick={onClose} className="record-button record-button-secondary">Cancel</button>
      <button type="button" disabled={busy || !ready.length || directory.isFetching || directory.isError || reading} onClick={() => { void importMembers(); }} aria-busy={busy} className="record-button record-button-primary">{busy ? <InlineLoader message="Importing members…" /> : "Import " + ready.length + (ready.length === 1 ? " member" : " members")}</button>
    </div>
  </Dialog>;
}
