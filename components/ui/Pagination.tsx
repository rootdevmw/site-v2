"use client";

import { getPaginationPages } from "@/lib/utils/pagination";

type Props = {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, total, limit, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, limit)));
  const currentPage = Math.min(totalPages, Math.max(1, page));
  const pages = getPaginationPages(currentPage, totalPages);
  const buttonClass = "min-h-11 shrink-0 rounded-lg border border-[var(--border-soft)] bg-[var(--card-elevated)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--hover-soft)] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4";

  return (
    <nav aria-label="Records pagination" className="@container">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage <= 1} className={buttonClass}>
          Previous
        </button>
        <p className="min-w-0 text-center text-xs text-[var(--text-secondary)] tabular-nums @2xl:hidden" aria-live="polite">
          Page {currentPage} of {totalPages}
        </p>
        <div className="hidden flex-wrap items-center justify-center gap-1 @2xl:flex">
          {pages.map((value, index) => value === "…" ? (
            <span key={"ellipsis-" + index} className="flex size-11 items-center justify-center text-sm text-[var(--text-secondary)]">…</span>
          ) : (
            <button key={value} type="button" onClick={() => onPageChange(value)} aria-label={"Page " + value} aria-current={value === currentPage ? "page" : undefined} className={"flex size-11 items-center justify-center rounded-lg text-sm font-medium transition " + (value === currentPage ? "bg-[var(--main-gold)] text-black" : "border border-[var(--border-soft)] bg-[var(--card-elevated)] text-[var(--text-secondary)] hover:bg-[var(--hover-soft)]")}>
              {value}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage >= totalPages} className={buttonClass}>
          Next
        </button>
      </div>
    </nav>
  );
}
