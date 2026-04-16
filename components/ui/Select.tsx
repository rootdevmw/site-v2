"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { FormField } from "./FormField";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, children, className = "", ...props }, ref) => {
    return (
      <FormField label={label} error={error}>
        <select
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
        >
          {children}
        </select>
      </FormField>
    );
  },
);

Select.displayName = "Select";
