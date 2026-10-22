"use client";
import Link from "next/link";
export default function ProgramError({ reset }: { reset: () => void }) {
  return (
    <section className="public-container public-section">
      <h1 className="public-display max-w-2xl text-4xl leading-tight">
        The program information could not load.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
        Please try again, or ask the church team about the planned service.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="public-button public-button-primary"
        >
          Try again
        </button>
        <Link
          href="/programs"
          className="public-button public-button-secondary"
        >
          Back to programs
        </Link>
        <Link href="/contact" className="public-text-link">
          Contact the church
        </Link>
      </div>
    </section>
  );
}
