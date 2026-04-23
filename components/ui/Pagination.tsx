"use client";

type Props = {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

function getPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  )
    pages.push(p);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export function Pagination({ page, total, limit, onPageChange }: Props) {
  const totalPages = Math.ceil(total / limit);
  const pages = totalPages > 1 ? getPages(page, totalPages) : null;

  return (
    <div className="flex items-center justify-between gap-4">
      <button
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--card-elevated)] text-[var(--text-primary)] border border-[var(--border-soft)] hover:bg-[var(--hover-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>

      {pages ? (
        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 w-7 items-center justify-center text-sm text-[var(--text-secondary)]"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-[var(--main-gold)] text-black"
                    : "border border-[var(--border-soft)] bg-[var(--card-elevated)] text-[var(--text-secondary)] hover:bg-[var(--hover-soft)]"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">Page {page}</p>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--card-elevated)] text-[var(--text-primary)] border border-[var(--border-soft)] hover:bg-[var(--hover-soft)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}
