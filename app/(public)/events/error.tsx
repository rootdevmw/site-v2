"use client";
import Link from "next/link";
export default function EventError({ reset }: { reset: () => void }) {
  return (
    <section className="public-container public-section">
      <h1 className="public-display max-w-2xl text-4xl leading-tight">
        The event information could not load.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
        Please try again, or ask the church team about current gatherings.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="public-button public-button-primary"
        >
          Try again
        </button>
        <Link href="/events" className="public-button public-button-secondary">
          Back to events
        </Link>
        <Link href="/contact" className="public-text-link">
          Contact the church
        </Link>
      </div>
    </section>
  );
}
