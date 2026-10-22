"use client";
import Link from "next/link";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="public-container public-section">
      <h1 className="public-display max-w-2xl text-4xl leading-tight">
        Messages could not load.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
        Please try again, or contact the church team if you need help finding a
        message.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="public-button public-button-primary"
        >
          Try again
        </button>
        <Link href="/content" className="public-button public-button-secondary">
          All messages
        </Link>
        <Link href="/contact" className="public-text-link">
          Contact the church
        </Link>
      </div>
    </section>
  );
}
