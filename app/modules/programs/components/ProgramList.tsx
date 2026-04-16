export function ProgramList({ programs }: { programs: any[] }) {
  return (
    <div className="space-y-4">
      {programs.map((p) => (
        <div
          key={p.id}
          className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl p-4"
        >
          <p className="text-sm text-[var(--text-secondary)]">{p.date}</p>

          <div className="mt-2 space-y-2">
            {p.items.map((item: any) => (
              <div key={item.order} className="flex justify-between text-sm">
                <span>{item.title}</span>
                <span className="text-[var(--text-secondary)]">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
