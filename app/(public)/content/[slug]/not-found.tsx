import Link from "next/link";
export default function MessageNotFound() {
  return (
    <section className="public-container public-section">
      <p className="public-eyebrow">Message not found</p>
      <h1 className="public-display mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">
        Let&apos;s find another message.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[var(--public-muted)]">
        This address does not point to an available message. It may have moved
        or no longer be published.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/content" className="public-button public-button-primary">
          Browse all messages
        </Link>
        <Link href="/contact" className="public-button public-button-secondary">
          Ask the church team
        </Link>
      </div>
    </section>
  );
}
