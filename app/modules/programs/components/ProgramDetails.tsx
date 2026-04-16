"use client";

import { ProgramDisplay } from "../types/programDisplay.types";

export function ProgramDetails({ program }: { program: ProgramDisplay }) {
  const items = [...program.items].sort(
    (a, b) => a.sequence - b.sequence
  );

  if (!items.length) {
    return (
      <div className="text-sm text-[var(--text-secondary)]">
        No program items
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase text-[var(--text-secondary)] bg-[var(--card-elevated)]">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Activity</th>
            <th className="px-4 py-3 text-left">Time</th>
            <th className="px-4 py-3 text-left">Responsible</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-[var(--hover-soft)]">
              <td className="px-4 py-3">{item.sequence}</td>

              <td className="px-4 py-3">
                <div className="font-medium">{item.title}</div>
                {item.description && (
                  <div className="text-xs text-[var(--text-secondary)]">
                    {item.description}
                  </div>
                )}
              </td>

              <td className="px-4 py-3 text-[var(--text-secondary)]">
                {item.time || "—"}
              </td>

              <td className="px-4 py-3">
                {item.responsible ? (
                  `${item.responsible.firstName} ${item.responsible.lastName}`
                ) : (
                  <span className="text-[var(--text-secondary)]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}