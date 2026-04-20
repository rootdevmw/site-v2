"use client";

import {
  forwardRef,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ForwardedRef,
  type InputHTMLAttributes,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  label?: string;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
    value?: string | Date | null;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  };

function formatDateValue(date: Date | null, type?: string) {
  if (!date) return "";

  if (type === "date") {
    return date.toISOString().slice(0, 10);
  }

  return date.toISOString();
}

function parseDateValue(value: string | Date | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function assignRef(
  ref: ForwardedRef<HTMLInputElement>,
  value: HTMLInputElement | null,
) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
}

export const DateInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      error,
      value,
      onChange,
      type = "date",
      disabled,
      name,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [open, setOpen] = useState(false);
    const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(
      parseDateValue(value),
    );
    const [tempDate, setTempDate] = useState<Date | null>(
      parseDateValue(value),
    );
    const selectedDate =
      value !== undefined ? parseDateValue(value) : internalSelectedDate;

    const commitDate = () => {
      const nextValue = formatDateValue(tempDate, type);

      if (value === undefined) {
        setInternalSelectedDate(tempDate);
      }
      setOpen(false);

      if (inputRef.current) {
        inputRef.current.value = nextValue;
      }

      onChange?.({
        target: {
          name,
          value: nextValue,
        },
        currentTarget: {
          name,
          value: nextValue,
        },
      } as ChangeEvent<HTMLInputElement>);
    };

    const cancelDate = () => {
      setTempDate(selectedDate);
      setOpen(false);
    };

    return (
      <div className="space-y-1 relative">
        {label && (
          <label
            htmlFor={id}
            className="text-sm text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}

        <input
          ref={(node) => {
            inputRef.current = node;
            assignRef(ref, node);
          }}
          id={id}
          type="hidden"
          name={name}
          disabled={disabled}
          onBlur={onBlur}
          {...props}
          {...(value !== undefined
            ? { value: formatDateValue(selectedDate, type) }
            : { defaultValue: formatDateValue(selectedDate, type) })}
        />

        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setTempDate(selectedDate);
              setOpen(true);
            }
          }}
          disabled={disabled}
          className={`w-full px-3 py-2 rounded-lg text-left text-sm outline-none transition-all duration-200
            ${
              error
                ? "bg-[var(--card-elevated)] border border-red-400 text-[var(--text-primary)] focus:ring-1 focus:ring-red-400"
                : "bg-[var(--card-elevated)] border border-[var(--border-soft)] text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--main-gold)] focus:border-[var(--main-gold)]"
            }
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          `}
        >
          {selectedDate ? selectedDate.toLocaleString() : "Select date & time"}
        </button>

        {open && !disabled && (
          <div className="absolute z-50 mt-2 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl p-4 shadow-lg">
            <DatePicker
              selected={tempDate}
              onChange={(date: Date | null) => setTempDate(date)}
              showTimeSelect={type === "datetime-local"}
              timeIntervals={15}
              inline
            />

            <div className="mt-3 text-sm text-[var(--text-secondary)]">
              Preview:{" "}
              <span className="text-[var(--text-primary)]">
                {tempDate ? tempDate.toLocaleString() : "No date selected"}
              </span>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={cancelDate}
                className="px-3 py-1 text-sm rounded-md bg-[var(--card-elevated)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={commitDate}
                className="px-3 py-1 text-sm rounded-md bg-[var(--main-gold)] text-black"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

DateInput.displayName = "DateInput";
