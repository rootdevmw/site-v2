"use client";

import { ReactNode, useEffect, useId, useRef } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "modal" | "drawer";
  closeDisabled?: boolean;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  variant = "modal",
  closeDisabled = false,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const isDrawer = variant === "drawer";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (!closeDisabled) onClose();
      }}
      onClose={() => {
        if (open) onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || closeDisabled) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom
        ) onClose();
      }}
      className={[
        "overflow-hidden border border-[var(--border-soft)] bg-[var(--card-bg)] p-0 text-[var(--text-primary)] shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        isDrawer
          ? "fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-[min(20rem,calc(100vw-2rem))] max-w-none border-y-0 border-l-0"
          : "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg rounded-2xl",
      ].join(" ")}
    >
      <div className={`flex min-h-0 flex-col ${isDrawer ? "h-full" : "max-h-[calc(100dvh-2rem)]"}`}>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold wrap-break-word">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label={`Close ${title.toLowerCase()}`}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--hover-soft)] disabled:opacity-40"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path strokeLinecap="round" d="m6 6 12 12M6 18 18 6" /></svg>
          </button>
        </div>
        <div className={`min-h-0 overflow-y-auto overscroll-contain ${isDrawer ? "flex-1" : "p-5 sm:p-6"}`}>
          {children}
        </div>
      </div>
    </dialog>
  );
}
