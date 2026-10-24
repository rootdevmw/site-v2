"use client";
import Link from "next/link";
import type { PublicGroupKind } from "@/lib/utils/public-groups";
export function GroupError({
  kind,
  reset,
}: {
  kind: PublicGroupKind;
  reset: () => void;
}) {
  return (
    <section className="public-container public-section">
      <h1 className="public-display max-w-2xl text-4xl leading-tight">
        The group information could not load.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
        Please try again, or contact the church team for help.
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
          href={kind === "ministry" ? "/ministries" : "/homecells"}
          className="public-button public-button-secondary"
        >
          Back to the directory
        </Link>
        <Link href="/contact" className="public-text-link">
          Contact the church
        </Link>
      </div>
    </section>
  );
}
