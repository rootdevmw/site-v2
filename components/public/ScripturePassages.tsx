"use client";

import { useEffect, useId, useRef, useState } from "react";

export function ScripturePassages({
  references,
}: {
  references: { label: string; query: string }[];
}) {
  return (
    <ul className="mt-4 space-y-3">
      {references.map((reference) => (
        <li key={reference.label}>
          <ScripturePassage reference={reference} />
        </li>
      ))}
    </ul>
  );
}

export function ScripturePassage({
  reference,
}: {
  reference: { label: string; query: string };
}) {
  const id = useId(),
    request = useRef<AbortController | null>(null);
  const [open, setOpen] = useState(false),
    [pending, setPending] = useState(false),
    [failed, setFailed] = useState(false);
  const [passage, setPassage] = useState<{
    text: string;
    translation: string;
  } | null>(null);
  useEffect(
    () => () => {
      request.current?.abort();
      request.current = null;
    },
    [],
  );

  async function load() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);
    setPending(true);
    setFailed(false);
    try {
      const response = await fetch(
        "https://bible-api.com/" + encodeURIComponent(reference.query),
        { signal: controller.signal, referrerPolicy: "no-referrer" },
      );
      if (!response.ok) throw new Error("Passage unavailable");
      const data: unknown = await response.json();
      if (
        !data ||
        typeof data !== "object" ||
        !("text" in data) ||
        typeof data.text !== "string" ||
        !data.text.trim()
      )
        throw new Error("Passage unavailable");
      if (request.current !== controller) return;
      setPassage({
        text: data.text.trim(),
        translation:
          "translation_name" in data &&
          typeof data.translation_name === "string"
            ? data.translation_name
            : "Translation supplied by bible-api.com",
      });
    } catch {
      if (request.current === controller) setFailed(true);
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setPending(false);
      }
    }
  }
  function toggle() {
    if (open) {
      request.current?.abort();
      request.current = null;
      setPending(false);
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!passage) void load();
  }
  return (
    <div className="min-w-0 rounded-lg bg-[var(--brand-soft)] p-4">
      <p className="text-sm font-semibold leading-7 wrap-anywhere">
        {reference.label}
      </p>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={id}
        aria-label={
          (open ? "Close passage: " : "Read passage: ") + reference.label
        }
        className="public-text-link mt-1"
      >
        {open ? "Close passage" : "Read passage"}
      </button>
      <div id={id} hidden={!open}>
        {pending && (
          <p role="status" className="mt-3 text-sm leading-7">
            Loading passage…
          </p>
        )}
        {failed ? (
          <div className="mt-3">
            <p role="status" className="text-sm leading-7">
              The passage preview could not load.
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="public-text-link"
            >
              Try again
            </button>
          </div>
        ) : (
          passage && (
            <div className="mt-3 border-t border-[#d9d0c3] pt-3">
              <p className="whitespace-pre-line text-sm leading-7 wrap-anywhere">
                {passage.text}
              </p>
              <p className="mt-3 text-xs leading-6 text-[var(--public-muted)]">
                Preview: {passage.translation}. Source: bible-api.com.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
