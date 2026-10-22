export function PublicEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[var(--brand-line)] bg-white p-6 text-sm text-[var(--text-secondary)]">
      {message}
    </div>
  );
}
