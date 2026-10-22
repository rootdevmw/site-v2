import Link from "next/link";
import { getPaginationHref, getPaginationPages } from "@/lib/utils/pagination";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  typeId?: string;
  search?: string;
  tags?: string;
};

export function Pagination({ page, totalPages, basePath, typeId, search, tags }: Props) {
  if (totalPages <= 1) return null;
  const currentPage = Math.min(totalPages, Math.max(1, page));
  const pages = getPaginationPages(currentPage, totalPages);
  const href = (value: number) => getPaginationHref(basePath, value, { typeId, q: search, tags });
  const linkClass = "inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[#e8c49a] bg-white px-3 py-2 text-sm font-medium text-[#4a2008] transition hover:bg-[#faebd7] sm:px-4";
  const disabledClass = linkClass + " opacity-40";

  return (
    <nav className="@container mt-10" aria-label="Pagination">
      <div className="flex items-center justify-between gap-2 @2xl:justify-center">
        {currentPage > 1 ? <Link href={href(currentPage - 1)} rel="prev" className={linkClass}>Previous</Link> : <span aria-disabled="true" className={disabledClass}>Previous</span>}
        <p className="min-w-0 text-center text-xs text-[#6b4c2a] tabular-nums @2xl:hidden">
          Page {currentPage} of {totalPages}
        </p>
        <div className="hidden flex-wrap items-center justify-center gap-1 @2xl:flex">
          {pages.map((value, index) => value === "…" ? (
            <span key={"ellipsis-" + index} className="flex size-11 items-center justify-center text-sm text-[#6b4c2a]">…</span>
          ) : (
            <Link key={value} href={href(value)} aria-label={"Page " + value} aria-current={value === currentPage ? "page" : undefined} className={"flex size-11 items-center justify-center rounded-lg text-sm font-medium transition " + (value === currentPage ? "bg-[#7c3d0f] text-white" : "border border-[#e8c49a] bg-white text-[#6b4c2a] hover:bg-[#faebd7]")}>
              {value}
            </Link>
          ))}
        </div>
        {currentPage < totalPages ? <Link href={href(currentPage + 1)} rel="next" className={linkClass}>Next</Link> : <span aria-disabled="true" className={disabledClass}>Next</span>}
      </div>
    </nav>
  );
}
