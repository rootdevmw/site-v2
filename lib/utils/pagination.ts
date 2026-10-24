export function getPaginationPages(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const current = Math.min(totalPages, Math.max(1, page));
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let value = Math.max(2, current - 1); value <= Math.min(totalPages - 1, current + 1); value++) pages.push(value);
  if (current < totalPages - 2) pages.push("…");
  pages.push(totalPages);
  return pages;
}

export function getPaginationHref(basePath: string, page: number, filters: Record<string, string | undefined> = {}) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
