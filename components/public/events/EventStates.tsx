import Link from "next/link";
export function EventLoading({ detail = false }: { detail?: boolean }) {
  return (
    <section className="public-container public-section" role="status">
      <p className="public-eyebrow">Come together</p>
      <h1 className="public-display mt-4 text-4xl leading-tight">
        {detail ? "Loading the gathering…" : "Loading events…"}
      </h1>
      <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
        Preparing the event information.
      </p>
    </section>
  );
}
export function EventNotFound() {
  return (
    <section className="public-container public-section">
      <p className="public-eyebrow">Event not found</p>
      <h1 className="public-display mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
        Let&apos;s find another gathering.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
        This event is not available at this address. Browse upcoming events or
        ask the church team about the gathering.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/events" className="public-button public-button-primary">
          Explore events
        </Link>
        <Link href="/contact" className="public-button public-button-secondary">
          Contact the church
        </Link>
      </div>
    </section>
  );
}
