"use client";

import { useEffect, useRef, useState } from "react";
import { exportMemberDirectory } from "@/lib/api/directory-records";
import type { DirectoryFilters } from "@/lib/utils/directory-records";

export function MemberDirectoryExport({ filters }: { filters: DirectoryFilters }) {
  const request = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => request.current?.abort(), []);
  async function download() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError("");
    try {
      const blob = await exportMemberDirectory(filters, controller.signal);
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "church-members.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      if (!controller.signal.aborted) setError("The export could not be downloaded. Check your connection and try again.");
    } finally {
      request.current = null;
      setPending(false);
    }
  }
  return <div className="directory-export"><button type="button" disabled={pending} aria-busy={pending} onClick={() => { void download(); }} className="record-button record-button-secondary">{pending ? "Preparing download…" : "Export XLSX"}</button><p className="directory-caption">All results matching the applied filters.</p>{error && <p role="alert" className="record-action-feedback text-red-800">{error}</p>}</div>;
}
