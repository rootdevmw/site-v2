"use client";

import { ReactNode } from "react";

type Column<T> = {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage: string;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
};

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b border-[var(--border-soft)] last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div
                className="h-4 rounded bg-[var(--card-elevated)] animate-pulse"
                style={{ width: `${60 + ((i * j * 17) % 30)}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  emptyMessage,
  onRowClick,
  actions,
}: TableProps<T>) {
  const totalCols = columns.length + (actions ? 1 : 0);

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl px-8 py-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card-elevated)]">
          <svg
            className="h-5 w-5 text-[var(--text-secondary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {emptyMessage}
        </p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Nothing to show yet.
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)]">
      <div role="region" aria-label="Records table, scroll horizontally for more columns" tabIndex={0} className="max-w-full overflow-x-auto overscroll-x-contain">
      <table className="w-full text-sm" style={{ minWidth: `${totalCols * 9}rem` }} aria-busy={Boolean(isLoading)}>
        <thead className="bg-[var(--card-elevated)] border-b border-[var(--border-soft)]">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]"
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)]">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <SkeletonRows cols={totalCols} />
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(event) => {
                  if (onRowClick && event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onRowClick(row);
                  }
                }}
                className={`border-b border-[var(--border-soft)] last:border-0 transition-colors ${
                  onRowClick
                    ? "cursor-pointer hover:bg-[var(--hover-soft)]"
                    : ""
                }`}
              >
                {columns.map((col, i) => (
                  <td
                    key={i}
                    className="max-w-xs px-4 py-3 text-[var(--text-primary)] wrap-anywhere"
                  >
                    {col.render
                      ? col.render(row)
                      : (row[col.accessor as keyof T] as ReactNode)}
                  </td>
                ))}

                {actions && (
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-wrap items-center justify-end gap-2 [&>button]:min-h-11 [&>button]:min-w-11">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
