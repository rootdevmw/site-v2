"use client";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
};

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
}: Props) {
  function toggle(val: string) {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-[var(--text-secondary)]">{label}</label>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt.value);

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              disabled={disabled}
              className={`px-3 py-1 rounded-full text-sm border transition-all duration-200
                ${
                  selected
                    ? "bg-[var(--main-gold)] text-black border-[var(--gold-dark)]"
                    : "bg-[var(--card-elevated)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:bg-[var(--hover-soft)]"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
