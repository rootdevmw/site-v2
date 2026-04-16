"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";

type Props = {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">;

export const DateInput = forwardRef<HTMLInputElement, Props>(
  ({ label, value, onValueChange, error, ...props }, ref) => {
    const id = useId();
    const [focused, setFocused] = useState(false);

    const hasValue = Boolean(value);
    const isFloated = true; // always float for date inputs

    return (
      <div className="date-input-root">
        <div className="date-input-field">
          {label && (
            <label
              htmlFor={id}
              className={`date-input-label${isFloated ? " floated" : ""}`}
            >
              {label}
            </label>
          )}

          <input
            ref={ref}
            id={id}
            type="date"
            value={value || ""}
            onChange={(e) => onValueChange?.(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={[
              "date-input-el",
              hasValue ? "has-value" : "",
              !label ? "no-label" : "",
              error ? "has-error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {/* Calendar icon */}
          <span className="date-input-icon" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
        </div>

        {error && <p className="date-input-error">{error}</p>}
      </div>
    );
  },
);

DateInput.displayName = "DateInput";
