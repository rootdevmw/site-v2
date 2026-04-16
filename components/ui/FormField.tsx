"use client";

import { ReactNode } from "react";

type Props = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, error, children }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-[var(--text-secondary)]">{label}</label>

      {children}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
