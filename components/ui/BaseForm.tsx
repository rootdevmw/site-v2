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

  return (
    <div className="space-y-6">
      {title && (
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {mode === "create" && "Create a new item"}
            {mode === "edit" && "Edit existing item"}
            {mode === "view" && "View item details"}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {children}

        {!isView && (
          <div className="flex justify-between pt-6 border-t border-[var(--border-soft)]">
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
              className="px-6 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Update"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
