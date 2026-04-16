export const Info = ({ label, value }: { label: string; value?: string }) => {
  return (
    <div>
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="text-sm font-medium text-[var(--text-primary)]">{value || "-"}</p>
    </div>
  );
};
