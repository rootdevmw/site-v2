"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import styles from "./sail-2027.module.css";

export function SailCopyButton({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "unavailable">(
    "idle",
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("unavailable");
    }
  }
  return (
    <span className={styles.copyControl}>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className={styles.copyButton}
      >
        {status === "copied" ? (
          <FiCheck aria-hidden="true" />
        ) : (
          <FiCopy aria-hidden="true" />
        )}
        {status === "copied" ? "Copied" : "Copy"}
      </button>
      <span role="status" className={styles.copyStatus}>
        {status === "unavailable"
          ? "Select the number or code to copy it."
          : status === "copied"
            ? `${label} copied.`
            : ""}
      </span>
    </span>
  );
}
