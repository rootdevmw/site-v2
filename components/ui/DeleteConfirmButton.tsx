"use client";

import { useState } from "react";

type DeleteConfirmButtonProps = {
  triggerLabel?: string;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<unknown> | unknown;
  className?: string;
  disabled?: boolean;
};

export function DeleteConfirmButton({
  triggerLabel = "Delete",
  title = "Confirm delete",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  className = "",
  disabled = false,
}: DeleteConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    try {
      setIsDeleting(true);
      await onConfirm();
      setOpen(false);
    } catch {
      // Mutation hooks own the error toast. Keep the modal open so the user can retry.
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={
          className ||
          "px-3 py-1 rounded-md text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50"
        }
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] shadow-xl">
            <div className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-lg font-semibold">
                !
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[var(--border-soft)] px-6 py-4">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm bg-[var(--card-elevated)] text-[var(--text-primary)] hover:bg-[var(--hover-soft)] transition-all duration-200 disabled:opacity-50"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
