"use client";

import { useState, useRef, useEffect } from "react";
import { FormField } from "./FormField";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  // ✅ close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <FormField label={label} error={error}>
      <div ref={ref} className="relative">
        {/* Input */}
        <input
          value={open ? search : selected?.label || ""}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200
          ${
            error
              ? "bg-[var(--card-elevated)] border border-red-400 focus:ring-1 focus:ring-red-400"
              : "bg-[var(--card-elevated)] border border-[var(--border-soft)] focus:ring-1 focus:ring-[var(--main-gold)]"
          }`}
        />

        {/* Dropdown */}
        {open && (
          <div className="absolute z-20 mt-1 w-full bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl shadow-lg max-h-60 overflow-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">
                No results
              </div>
            )}

            {filtered.map((option, index) => (
              <div
                key={option.value ?? index}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-[var(--hover-soft)] transition"
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </FormField>
  );
}
