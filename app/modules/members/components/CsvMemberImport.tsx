"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBulkCreateMembers } from "../hooks/useBulkCreateMembers";
import { MemberFormValues } from "../types/member.types";

const VALID_STATUSES = ["VISITOR", "MEMBER"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];
const VALID_PREFIXES = ["PASTOR", "DEACON", "SISTER", "BROTHER"] as const;
type ValidPrefix = (typeof VALID_PREFIXES)[number];

type ParsedRow = {
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  prefix: string;
  location: string;
  issues: string[];
};

function splitCsvLine(line: string): string[] {
  const cols: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cols.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cols.push(cur.trim());
  return cols;
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .split("\n")
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Detect header by checking if first row contains known column names
  const firstNorm = lines[0].toLowerCase().replace(/\s/g, "");
  const hasHeader =
    firstNorm.includes("firstname") ||
    firstNorm.includes("first_name") ||
    firstNorm.includes("lastname") ||
    firstNorm.includes("last_name") ||
    firstNorm.includes("phone");

  const data = hasHeader ? lines.slice(1) : lines;

  return data.map((line) => {
    const cols = splitCsvLine(line);
    const firstName = cols[0] || "";
    const lastName = cols[1] || "";
    const phone = cols[2] || "";
    const status = cols[3] || "";
    const prefix = cols[4] || "";
    const location = cols[5] || "";

    const issues: string[] = [];
    if (!firstName) issues.push("First name required");
    if (!lastName) issues.push("Last name required");
    if (!phone) issues.push("Phone required");
    if (!VALID_STATUSES.includes(status as ValidStatus)) {
      issues.push(`Status must be Visitor, Member, or Baptized`);
    }
    if (prefix && !VALID_PREFIXES.includes(prefix as ValidPrefix)) {
      issues.push(`Prefix must be PASTOR, DEACON, SISTER, or BROTHER`);
    }

    return { firstName, lastName, phone, status, prefix, location, issues };
  });
}

export function CsvMemberImport() {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bulk = useBulkCreateMembers();

  function processFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRows(parseCsv(text));
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

  function reset() {
    setRows([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  const validRows = rows.filter((r) => r.issues.length === 0);

  function handleImport() {
    const members: MemberFormValues[] = validRows.map((r) => ({
      firstName: r.firstName,
      lastName: r.lastName,
      phone: r.phone,
      status: r.status as ValidStatus,
      prefix: r.prefix as ValidPrefix,
      location: r.location || undefined,
    }));

    bulk.mutate(
      { members },
      { onSuccess: () => router.push("/dashboard/members") },
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="rounded-xl border border-(--border-soft) bg-(--card-elevated) px-4 py-3 text-sm text-(--text-secondary) space-y-1">
        <p className="font-medium text-(--text-primary)">Expected CSV format</p>
        <p className="font-mono text-xs">
          firstName, lastName, phone, status, prefix, location
        </p>
        <p className="text-xs">
          Required: firstName, lastName, phone, status (VISITOR / MEMBER /
          BAPTIZED). Prefix and Location are optional. First row may be a
          header.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 cursor-pointer transition
          ${
            dragging
              ? "border-(--main-gold) bg-(--main-gold)/5"
              : "border-(--border-soft) hover:border-(--main-gold)/50 hover:bg-(--hover-soft)"
          }`}
      >
        <svg
          className="h-9 w-9 text-(--text-secondary)"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm text-(--text-secondary)">
          {rows.length > 0
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
      {rows.length > 0 && (
        <div className="rounded-xl border border-(--border-soft) overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1.5fr] text-xs font-medium text-(--text-secondary) px-4 py-2 bg-(--card-elevated) border-b border-(--border-soft)">
            <span>First Name</span>
            <span>Last Name</span>
            <span>Phone</span>
            <span>Status</span>
            <span>Issues</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-(--border-soft)">
            {rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_1.5fr] items-center px-4 py-2.5 text-sm"
              >
                <span className={!r.firstName ? "text-red-400" : ""}>
                  {r.firstName || "—"}
                </span>
                <span className={!r.lastName ? "text-red-400" : ""}>
                  {r.lastName || "—"}
                </span>
                <span className={!r.phone ? "text-red-400" : ""}>
                  {r.phone || "—"}
                </span>
                <span
                  className={
                    !VALID_STATUSES.includes(r.status as ValidStatus)
                      ? "text-red-400"
                      : ""
                  }
                >
                  {r.status || "—"}
                </span>
                <span>
                  {r.issues.length === 0 ? (
                    <span className="text-xs text-green-400">Ready</span>
                  ) : (
                    <span className="text-xs text-amber-400">
                      {r.issues.join(" · ")}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-(--text-secondary)">
            {validRows.length} of {rows.length} rows valid
            {rows.length - validRows.length > 0 && (
              <span className="text-amber-400 ml-1">
                ({rows.length - validRows.length} will be skipped)
              </span>
            )}
          </span>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 rounded-lg text-sm bg-(--card-elevated) text-(--text-primary) hover:bg-(--hover-soft) border border-(--border-soft) transition"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={validRows.length === 0 || bulk.isPending}
              onClick={handleImport}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-(--main-gold) text-black hover:opacity-90 transition disabled:opacity-40"
            >
              {bulk.isPending
                ? "Importing..."
                : `Import ${validRows.length} member${validRows.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
