export const Info = ({ label, value }: { label: string; value?: string }) => {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="text-sm font-medium text-[var(--text-primary)]">
        {value || "—"}
      </p>
    </div>
  );
};
