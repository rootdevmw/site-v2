"use client";

type Props = {
  page: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: Props) {
  return (
    <div className="flex justify-between items-center">
      <button
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1}
        className="px-3 py-1 rounded-md text-sm 
        bg-[var(--card-elevated)] text-[var(--text-primary)] 
        hover:bg-[var(--hover-soft)] transition-all duration-200 
        disabled:opacity-50"
      >
        Previous
      </button>

      <p className="text-sm text-[var(--text-secondary)]">
        Page {page} {totalPages ? `of ${totalPages}` : ""}
      </p>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!!totalPages && page >= totalPages}
        className="px-3 py-1 rounded-md text-sm 
        bg-[var(--card-elevated)] text-[var(--text-primary)] 
        hover:bg-[var(--hover-soft)] transition-all duration-200 
        disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
