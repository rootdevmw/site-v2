"use client";

export function BaseForm({
  title,
  isLoading,
  onSubmit,
  onDelete,
  mode,
  children,
}: {
  title?: string;
  isLoading?: boolean;
  onSubmit: () => void;
  onDelete?: () => void;
  mode?: "create" | "edit" | "view";
  children: React.ReactNode;
}) {
  const isView = mode === "view";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {title && <h1 className="text-2xl font-semibold">{title}</h1>}

      {children}

      <div className="flex justify-between items-center">
        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400"
          >
            Delete
          </button>
        )}

        {!isView && (
          <button
            type="submit"
            disabled={isLoading}
            className="ml-auto px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black"
          >
            {isLoading ? "Saving..." : mode === "edit" ? "Update" : "Create"}
          </button>
        )}
      </div>
    </form>
  );
}
