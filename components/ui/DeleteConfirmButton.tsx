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
      // Mutation hooks own the error toast. Keep modal open so user can retry.
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
          "px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        }
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[var(--border-soft)] px-6 py-4">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--card-elevated)] text-[var(--text-primary)] hover:bg-[var(--hover-soft)] transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
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
