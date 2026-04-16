"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;

  actions?: ReactNode; // Add buttons
  filters?: ReactNode; // Search + selects

  children: ReactNode; // Table
  pagination?: ReactNode;
};

export function TableLayout({
  title,
  description,
  actions,
  filters,
  children,
  pagination,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-2">{actions}</div>
      </div>

      {/* Filters */}
      {filters && (
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-4">
          {filters}
        </div>
      )}

      {/* Table */}
      {children}

      {/* Pagination */}
      {pagination && <div>{pagination}</div>}
    </div>
  );
}
