"use client";

import { useState, useRef } from "react";
import { MinistryMember } from "../types/ministry.types";
import { useBulkAssignMembers } from "../hooks/useBulkAssignMembers";

type CsvRow = { firstName: string; lastName: string };

type MatchResult = CsvRow & {
  member: MinistryMember | null;
  alreadyAssigned: boolean;
};

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .split("\n")
    .filter(Boolean);

  if (lines.length === 0) return [];

  const firstNorm = lines[0].toLowerCase().replace(/\s/g, "");
  const hasHeader =
    firstNorm.includes("firstname") ||
    firstNorm.includes("first_name") ||
    firstNorm.includes("lastname") ||
    firstNorm.includes("last_name");

  const data = hasHeader ? lines.slice(1) : lines;

  return data
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      let firstName = cols[0] || "";
      let lastName = cols[1] || "";

      // Single column with a space → split into first/last
      if (firstName && !lastName && firstName.includes(" ")) {
        const [fn, ...rest] = firstName.split(" ");
        firstName = fn;
        lastName = rest.join(" ");
      }

      return { firstName, lastName };
    })
    .filter((r) => r.firstName);
}

function matchRows(
  rows: CsvRow[],
  allMembers: MinistryMember[],
  assignedIds: Set<string>,
): MatchResult[] {
  return rows.map((row) => {
    const member =
      allMembers.find(
        (m) =>
          m.firstName.toLowerCase() === row.firstName.toLowerCase() &&
          m.lastName.toLowerCase() === row.lastName.toLowerCase(),
      ) ?? null;

    return {
      ...row,
      member,
      alreadyAssigned: member ? assignedIds.has(member.id) : false,
    };
  });
}

type Props = {
  ministryId: string;
  allMembers: MinistryMember[];
  assignedIds: Set<string>;
};

export function CsvMemberUpload({ ministryId, allMembers, assignedIds }: Props) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bulk = useBulkAssignMembers();

  function reset() {
    setResults([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function close() {
    setOpen(false);
    reset();
  }

  function processFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCsv(text);
      setResults(matchRows(rows, allMembers, assignedIds));
    };
    reader.readAsText(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  const toAssign = results.filter((r) => r.member && !r.alreadyAssigned);

  function handleImport() {
    const memberIds = toAssign.map((r) => r.member!.id);
    bulk.mutate({ ministryId, memberIds }, { onSuccess: close });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-2 text-sm rounded-lg bg-(--card-elevated) border border-(--border-soft) text-(--text-primary) hover:bg-(--hover-soft) transition"
      >
        Import CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-(--border-soft) bg-(--card-bg) shadow-2xl">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-(--border-soft)">
              <h2 className="text-base font-semibold text-(--text-primary)">
                Import Members via CSV
              </h2>
              <p className="mt-1 text-xs text-(--text-secondary)">
                Expected columns:{" "}
                <span className="font-mono">firstName, lastName</span>
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition
                  ${
                    dragging
                      ? "border-(--main-gold) bg-(--main-gold)/5"
                      : "border-(--border-soft) hover:border-(--main-gold)/50 hover:bg-(--hover-soft)"
                  }`}
              >
                <svg
                  className="h-8 w-8 text-(--text-secondary)"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm text-(--text-secondary)">
                  {results.length > 0
                    ? "Drop another file or click to replace"
                    : "Drop a .csv file here or click to browse"}
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Preview */}
              {results.length > 0 && (
                <div className="rounded-xl border border-(--border-soft) overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto] text-xs font-medium text-(--text-secondary) px-4 py-2 bg-(--card-elevated) border-b border-(--border-soft)">
                    <span>Name</span>
                    <span>Status</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-(--border-soft)">
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_auto] items-center px-4 py-2.5 text-sm"
                      >
                        <span>
                          {r.firstName} {r.lastName}
                        </span>
                        {r.alreadyAssigned ? (
                          <span className="text-xs text-(--text-secondary)">
                            Already assigned
                          </span>
                        ) : r.member ? (
                          <span className="text-xs text-green-400">Ready</span>
                        ) : (
                          <span className="text-xs text-amber-400">
                            Not found
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-(--border-soft)">
              <span className="text-xs text-(--text-secondary)">
                {results.length > 0
                  ? `${toAssign.length} of ${results.length} rows ready to import`
                  : "No file selected"}
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 rounded-lg text-sm bg-(--card-elevated) text-(--text-primary) hover:bg-(--hover-soft) transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={toAssign.length === 0 || bulk.isPending}
                  onClick={handleImport}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-(--main-gold) text-black hover:opacity-90 transition disabled:opacity-40"
                >
                  {bulk.isPending
                    ? "Importing..."
                    : `Import ${toAssign.length}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
