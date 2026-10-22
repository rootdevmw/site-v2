"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";
import { InlineLoader } from "./InlineLoader";

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
  const [failed, setFailed] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    setFailed(false);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      setFailed(true);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button type="button" disabled={disabled} onClick={() => { setFailed(false); setOpen(true); }} className={className || "min-h-11 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"}>
        {triggerLabel}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} description={description} closeDisabled={isDeleting}>
        <div className="space-y-5">
          <div aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-700">
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01m-7.5 4h15a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0L2.8 17a2 2 0 0 0 1.7 3Z" /></svg>
          </div>
          {failed && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">This action could not be completed. Please try again.</p>}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" disabled={isDeleting} onClick={() => setOpen(false)} className="min-h-11 rounded-lg border border-[var(--border-soft)] bg-[var(--card-elevated)] px-4 py-2 text-sm font-medium hover:bg-[var(--hover-soft)] disabled:opacity-50">
              {cancelLabel}
            </button>
            <button type="button" disabled={isDeleting} aria-busy={isDeleting} onClick={handleConfirm} className="min-h-11 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50">
              {isDeleting ? <InlineLoader message="Working…" /> : confirmLabel}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
