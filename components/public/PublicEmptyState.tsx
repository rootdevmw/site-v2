export function PublicEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#e8c49a] bg-white p-6 text-sm text-[#6b4c2a]">
      {message}
    </div>
  );
}
