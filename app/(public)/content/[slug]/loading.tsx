export default function MessageLoading() {
  return (
    <section className="public-container public-section" role="status">
      <p className="public-eyebrow">Church messages</p>
      <h1 className="public-display mt-4 text-4xl">Loading the message…</h1>
      <p className="mt-5 text-base leading-8 text-[var(--public-muted)]">
        Preparing the teaching and its scripture references.
      </p>
    </section>
  );
}
