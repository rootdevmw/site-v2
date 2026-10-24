export function InlineLoader({ message = "Saving…" }: { message?: string }) {
  return (
    <span role="status" className="inline-flex items-center justify-center gap-2">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4 animate-spin motion-reduce:animate-none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" className="opacity-25" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {message}
    </span>
  );
}
