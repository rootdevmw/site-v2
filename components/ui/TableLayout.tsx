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
    <div className="@container min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--border-soft)] pb-5 @2xl:flex-row @2xl:items-start @2xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] wrap-anywhere">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex max-w-full shrink-0 flex-wrap gap-2 [&>div]:flex-wrap [&_button]:min-h-11 [&_a]:min-h-11">{actions}</div>}
      </div>

      {/* Filters */}
      {filters && (
        <div className="min-w-0 rounded-xl border border-[var(--border-soft)] bg-[var(--card-elevated)] px-4 py-3 [&_input]:min-w-0 [&_select]:max-w-full">
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
