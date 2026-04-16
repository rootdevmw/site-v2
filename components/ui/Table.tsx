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

export function Table<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  emptyMessage,
  onRowClick,
  actions,
}: TableProps<T>) {
  if (isLoading) {
    return <div className="p-4 text-sm">Loading...</div>;
  }
  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="p-6 text-sm text-center text-[var(--text-secondary)]">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        {/* HEADER */}
        <thead className="text-xs text-[var(--text-secondary)] bg-[var(--card-elevated)]">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left">
                {col.header}
              </th>
            ))}

            {actions && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`
                transition
                ${onRowClick ? "cursor-pointer hover:bg-[var(--hover-soft)]" : ""}
              `}
            >
              {columns.map((col, i) => (
                <td key={i} className="px-4 py-3">
                  {col.render
                    ? col.render(row)
                    : (row[col.accessor as keyof T] as ReactNode)}
                </td>
              ))}

              {actions && (
                <td
                  className="px-4 py-3 text-right space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
