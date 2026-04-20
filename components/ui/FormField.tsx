"use client";

import { ReactNode } from "react";

type Props = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, error, children }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
