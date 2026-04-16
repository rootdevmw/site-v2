"use client";

import { forwardRef, InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="text-sm text-[var(--text-secondary)]">{label}</label>

        <input
          ref={ref}
          {...props}
          className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200
            ${
              error
                ? "bg-[var(--card-elevated)] border border-red-400 text-[var(--text-primary)] focus:ring-1 focus:ring-red-400"
                : "bg-[var(--card-elevated)] border border-[var(--border-soft)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--main-gold)] focus:border-[var(--main-gold)]"
            }
            ${className}
          `}
        />

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
