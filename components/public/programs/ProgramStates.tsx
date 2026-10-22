import Link from "next/link";
export function ProgramLoading({ detail = false }: { detail?: boolean }) {
  return (
    <section className="public-container public-section" role="status">
      <p className="public-eyebrow">Worship together</p>
      <h1 className="public-display mt-4 text-4xl leading-tight">
        {detail ? "Loading the program…" : "Loading programs…"}
      </h1>
      <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
        Preparing the planned service information.
      </p>
    </section>
  );
}
export function ProgramNotFound() {
  return (
    <section className="public-container public-section">
      <p className="public-eyebrow">Program not found</p>
      <h1 className="public-display mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
        Let&apos;s find another program.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
        This program is not available at this address. Browse the programs or
        ask the church team about the planned service.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/programs" className="public-button public-button-primary">
          Explore programs
        </Link>
        <Link href="/contact" className="public-button public-button-secondary">
          Contact the church
        </Link>
      </div>
    </section>
  );
}
