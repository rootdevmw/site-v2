"use client";

import { useId, useRef, useState } from "react";
import { FiShare2 } from "react-icons/fi";

export function ShareButton({
  title,
  path,
  label = "Share",
}: {
  title: string;
  path?: string;
  label?: string;
}) {
  const id = useId(),
    busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  async function handleShare() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setStatus("");
    setManualUrl("");
    const url = path
      ? new URL(path, window.location.origin).href
      : window.location.href;
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title, url });
          setStatus("Link shared.");
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") return;
        }
      }
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setStatus("Link copied.");
    } catch {
      setManualUrl(url);
      setStatus("Copy the link below to share.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={handleShare}
        disabled={pending}
        className="public-button public-button-secondary"
      >
        <FiShare2 aria-hidden="true" />
        {pending ? "Sharing…" : label}
      </button>
      <p
        role="status"
        className="mt-3 text-sm leading-7 text-[var(--public-muted)]"
      >
        {status}
      </p>
      {manualUrl && (
        <div className="mt-3">
          <label htmlFor={id} className="mb-2 block text-sm font-semibold">
            Link to share
          </label>
          <input
            id={id}
            type="text"
            value={manualUrl}
            readOnly
            onFocus={(event) => event.currentTarget.select()}
            className="public-input"
          />
        </div>
      )}
    </div>
  );
}
