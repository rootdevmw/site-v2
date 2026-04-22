export function PublicSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-[#c2620a]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 text-3xl font-semibold text-[#4a2008]">{title}</h2>
      {description && (
        <p className="mt-3 text-base leading-7 text-[#6b4c2a]">
          {description}
        </p>
      )}
    </div>
  );
}
