import Link from "next/link";

function getPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

function buildHref(basePath: string, p: number, typeId?: string) {
  const params = new URLSearchParams();
  if (p > 1) params.set("page", String(p));
  if (typeId) params.set("typeId", typeId);
  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  typeId,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  typeId?: string; // optional so it works on pages without filtering
  search?: string;
  tags?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = getPages(page, totalPages);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <Link
        href={page > 1 ? buildHref(basePath, page - 1, typeId) : "#"}
        aria-disabled={page <= 1}
        className={[
          "rounded-lg border px-4 py-2 text-sm font-medium transition",
          page <= 1
            ? "pointer-events-none border-[#e8c49a] bg-[#fdf6ee] text-[#c4a882]"
            : "border-[#e8c49a] bg-white text-[#4a2008] hover:border-[#7c3d0f]/30 hover:shadow-sm",
        ].join(" ")}
      >
        ← Prev
      </Link>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-9 w-7 items-center justify-center text-sm text-[#c2a23a]"
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(basePath, p, typeId)}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition",
                p === page
                  ? "bg-[#c2620a] text-white"
                  : "border border-[#e8c49a] bg-white text-[#6b4c2a] hover:border-[#7c3d0f]/30",
              ].join(" ")}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      <Link
        href={page < totalPages ? buildHref(basePath, page + 1, typeId) : "#"}
        aria-disabled={page >= totalPages}
        className={[
          "rounded-lg border px-4 py-2 text-sm font-medium transition",
          page >= totalPages
            ? "pointer-events-none border-[#e8c49a] bg-[#fdf6ee] text-[#c4a882]"
            : "border-[#e8c49a] bg-white text-[#4a2008] hover:border-[#7c3d0f]/30 hover:shadow-sm",
        ].join(" ")}
      >
        Next →
      </Link>
    </nav>
  );
}
