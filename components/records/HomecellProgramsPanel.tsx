"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";
import { ProgramForm } from "@/app/modules/programs/components/ProgramForm";
import { getHomecellPrograms } from "@/lib/api/group-records";
import { formatChurchDate } from "@/lib/utils/church-date";
import { retryRecordRequest } from "@/lib/utils/record-details";
import { RecordSection } from "./RecordLayout";
import { RecordPager } from "./RecordPager";

export function HomecellProgramsPanel({ homecellId }: { homecellId: string }) {
  const [page, setPage] = useState(1);
  const [editorMounted, setEditorMounted] = useState(false);
  const query = useQuery({
    queryKey: ["programs", "homecell", homecellId, page],
    queryFn: ({ signal }) => getHomecellPrograms(homecellId, page, signal),
    retry: retryRecordRequest,
  });
  const programs = query.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((query.data?.meta?.total ?? 0) / 5));
  return <RecordSection title="Program schedule" description="Programs for this homecell, with the most recent dates first.">
    <details className="mb-6 rounded-xl border border-[#e7e0d5]" onToggle={(event) => { if (event.currentTarget.open) setEditorMounted(true); }}>
      <summary className="flex min-h-12 cursor-pointer items-center gap-2 p-4 text-sm font-semibold"><FiPlus aria-hidden="true" />Create a program</summary>
      {editorMounted && <div className="min-w-0 border-t border-[#e7e0d5] p-3 sm:p-4"><ProgramForm embedded mode="create" initialData={{ homecellId }} /></div>}
    </details>
    {query.isPending ? <p role="status" className="record-empty">Loading programs…</p> : query.isError ? <div role="alert"><p className="record-empty">The program schedule could not be loaded.</p><button type="button" onClick={() => { void query.refetch(); }} className="record-button record-button-secondary mt-3">Try again</button></div> : programs.length ? <>
      <ul className="record-related">{programs.map((program) => <li key={program.id}><Link href={"/dashboard/programs/" + encodeURIComponent(program.id)}><span className="min-w-0"><span className="block wrap-anywhere">{program.type?.name || "Service program"}</span><span className="mt-1 block text-xs font-normal leading-6 text-[#6c6257]">{formatChurchDate(program.date, { day: "numeric", month: "long", year: "numeric" })}{program.items && " · " + program.items.length + " activities"}</span></span><FiArrowUpRight aria-hidden="true" className="size-4 shrink-0" /></Link></li>)}</ul>
      <RecordPager page={page} totalPages={totalPages} onPageChange={setPage} disabled={query.isFetching} label="Homecell program pages" />
    </> : <p className="record-empty">No programs are recorded for this homecell. Create one when the next gathering is planned.</p>}
    <Link href="/dashboard/programs" className="record-back !mb-0 mt-5">Open all church programs<FiArrowUpRight aria-hidden="true" /></Link>
  </RecordSection>;
}
