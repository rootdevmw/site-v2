"use client";

import { type ReactNode, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";

export function RecordActionsMenu({ children }: { children: ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  return <details ref={detailsRef} className="record-more-actions" onKeyDown={(event) => {
    if (event.key !== "Escape" || event.currentTarget.querySelector("dialog[open]")) return;
    event.currentTarget.open = false;
    event.currentTarget.querySelector("summary")?.focus();
    event.preventDefault();
  }}>
    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">More actions <FiChevronDown aria-hidden="true" /></summary>
    <div className="pt-3">{children}</div>
  </details>;
}
