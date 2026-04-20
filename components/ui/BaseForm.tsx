"use client";

import { ReactNode } from "react";
import { DeleteConfirmButton } from "./DeleteConfirmButton";

type BaseFormProps = {
  mode: "create" | "edit" | "view";
  isLoading?: boolean;
  onSubmit: () => void;
  onDelete?: () => void;
  title?: string;
  children: ReactNode;
};

const MODE_PILL = {
  create: { label: "New", className: "bg-emerald-500/10 text-emerald-400" },
  edit: { label: "Editing", className: "bg-[var(--main-gold)]/10 text-[var(--main-gold)]" },
  view: { label: "Viewing", className: "bg-[var(--card-elevated)] text-[var(--text-secondary)]" },
};

export function BaseForm({
  mode,
  isLoading = false,
  onSubmit,
  onDelete,
  title,
  children,
}: BaseFormProps) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const pill = MODE_PILL[mode];

  return (
    <div className="space-y-5">
      {title && (
        <div className="flex items-center gap-3 pb-5 border-b border-[var(--border-soft)]">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            {title}
          </h1>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${pill.className}`}
          >
            {pill.label}
          </span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-5">
          {children}
        </div>

        {!isView && (
          <div className="flex items-center justify-between pt-1">
            <div>
              {isEdit && onDelete && (
                <DeleteConfirmButton
                  triggerLabel="Delete"
                  title="Confirm delete"
                  description="This action cannot be undone. Are you sure you want to delete this item?"
                  confirmLabel="Delete"
                  cancelLabel="Cancel"
                  onConfirm={onDelete}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
