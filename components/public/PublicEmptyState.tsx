export function PublicEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#d8e2dc] bg-white p-6 text-sm text-[#52645d]">
      {message}
    </div>
  );
}
