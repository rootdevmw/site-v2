"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-[var(--border-soft)]">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>

      {/* Filters */}
      {filters && (
        <div className="bg-[var(--card-elevated)] border border-[var(--border-soft)] rounded-xl px-4 py-3">
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
