import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

export function RecordPager({ page, totalPages, onPageChange, disabled = false, label }: {
  page: number; totalPages: number; onPageChange: (page: number) => void; disabled?: boolean; label: string;
}) {
  if (totalPages <= 1) return null;
  return <nav aria-label={label} className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7e0d5] pt-4">
    <button type="button" className="record-button record-button-secondary" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}><FiArrowLeft aria-hidden="true" />Previous</button>
    <span className="text-xs text-[#6c6257]">Page {page} of {totalPages}</span>
    <button type="button" className="record-button record-button-secondary" disabled={disabled || page >= totalPages} onClick={() => onPageChange(page + 1)}>Next<FiArrowRight aria-hidden="true" /></button>
  </nav>;
}
