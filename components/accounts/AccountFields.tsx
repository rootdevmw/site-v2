"use client";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  help?: string;
};
export const AccountField = forwardRef<HTMLInputElement, FieldProps>(
  function AccountField({ id, label, error, help, ...props }, ref) {
    return (
      <div className="account-field">
        <label htmlFor={id}>{label}</label>
        <input
          {...props}
          id={id}
          ref={ref}
          className="account-input"
          aria-invalid={!!error}
          aria-describedby={
            [help && id + "-help", error && id + "-error"]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {help && (
          <p id={id + "-help"} className="account-help">
            {help}
          </p>
        )}
        {error && (
          <p id={id + "-error"} className="account-field-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);
export const AccountPasswordField = forwardRef<HTMLInputElement, FieldProps>(
  function AccountPasswordField({ id, label, error, help, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="account-field">
        <label htmlFor={id}>{label}</label>
        <div className="account-password">
          <input
            {...props}
            id={id}
            ref={ref}
            type={visible ? "text" : "password"}
            className="account-input"
            aria-invalid={!!error}
            aria-describedby={
              [help && id + "-help", error && id + "-error"]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          <button
            type="button"
            disabled={props.disabled}
            aria-label={(visible ? "Hide " : "Show ") + label.toLowerCase()}
            aria-controls={id}
            aria-pressed={visible}
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>
        {help && (
          <p id={id + "-help"} className="account-help">
            {help}
          </p>
        )}
        {error && (
          <p id={id + "-error"} className="account-field-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);
export const AccountErrorSummary = forwardRef<
  HTMLDivElement,
  {
    entries: { path: string; message: string }[];
    failure: string;
    prefix: string;
  }
>(function AccountErrorSummary({ entries, failure, prefix }, ref) {
  if (!entries.length && !failure) return null;
  return (
    <div
      className="account-feedback account-feedback-error"
      role="alert"
      tabIndex={-1}
      ref={ref}
    >
      <h2>{failure ? "Could not confirm this step" : "Check your details"}</h2>
      {failure && <p>{failure}</p>}
      {!!entries.length && (
        <ul>
          {entries.map((entry) => (
            <li key={entry.path}>
              <a
                href={"#" + prefix + entry.path}
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(prefix + entry.path)?.focus();
                }}
              >
                {entry.message}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
