"use client";
import Link from "next/link";

export function LibraryLoading() {
  return (
    <section
      className="public-container public-section"
      role="status"
      aria-live="polite"
    >
      <p className="public-eyebrow">Church resources</p>
      <p className="public-display mt-4 text-3xl">Loading the library...</p>
    </section>
  );
}

export function LibraryError({ reset }: { reset: () => void }) {
  return (
    <section className="public-container public-section">
      <h1 className="public-display max-w-2xl text-4xl leading-tight">
        This resource could not load.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
        Please try again, or contact the church team for help finding a
        broadcast or publication.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="public-button public-button-primary"
        >
          Try again
        </button>
        <Link href="/live" className="public-button public-button-secondary">
          Broadcasts
        </Link>
        <Link
          href="/publications"
          className="public-button public-button-secondary"
        >
          Publications
        </Link>
        <Link href="/contact" className="public-text-link">
          Contact the church
        </Link>
      </div>
    </section>
  );
}
