"use client";

import { useState } from "react";
import { useCreateProgramType } from "@/app/modules/programs/hooks/useCreateProgramType";

export function CreateProgramTypeModal({
  onCreated,
}: {
  onCreated?: (type: { id: string; name: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const { mutateAsync, isPending } = useCreateProgramType();

  const handleCreate = async () => {
    if (!name.trim()) return;

    const res = await mutateAsync({ name });

    onCreated?.(res.data);
    setName("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--main-gold)] hover:underline"
      >
        + Add new type
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-lg border border-[var(--border-soft)] bg-[var(--card-elevated)] space-y-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type name"
        className="w-full px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-soft)]"
      />

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-[var(--text-secondary)]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          className="px-3 py-1 rounded-md bg-[var(--main-gold)] text-black text-sm"
        >
          {isPending ? "Saving..." : "Create"}
        </button>
      </div>
    </div>
  );
}
