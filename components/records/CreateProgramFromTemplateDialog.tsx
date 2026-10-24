"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ProgramTemplate } from "@/app/modules/programTemplates/types/programTemplate.types";
import { useCreateProgramFromTemplate } from "@/app/modules/programs/hooks/useCreateProgramFromTemplate";
import { getTemplateCreationInput } from "@/lib/utils/program-records";
import { getRecordFailure } from "@/lib/utils/record-details";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function CreateProgramFromTemplateDialog({ template, refreshing = false }: { template: ProgramTemplate; refreshing?: boolean }) {
  const router = useRouter();
  const mutation = useCreateProgramFromTemplate();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const dateId = useId();
  const descriptionId = useId();
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending || refreshing || createdId) return;
    setError(null);
    let input;
    try { input = getTemplateCreationInput(template.id, date); }
    catch { setError("Choose a valid date for the new program."); return; }
    try {
      const result = await mutation.mutateAsync(input);
      setCreatedId(result.data.id);
      router.push("/dashboard/programs/" + encodeURIComponent(result.data.id));
    } catch (failure) {
      const kind = getRecordFailure(failure);
      setError(kind === "session" ? "Your session may have expired. Sign in again before creating a program." : kind === "forbidden" ? "Your account cannot create this program." : kind === "missing" ? "This template is no longer available. Return to the template list and choose another." : "Could not confirm creation. Check the program list for " + date + " before trying again; the request may have succeeded.");
    }
  }
  return <>
    <button type="button" className="record-button record-button-primary" disabled={refreshing || mutation.isPending} onClick={() => setOpen(true)}>Use this template</button>
    <Dialog open={open} onClose={() => { if (!mutation.isPending) setOpen(false); }} closeDisabled={mutation.isPending} title="Create a program from this template" description={"Use “" + template.name + "” as the starting point for a dated program."}>
      <form onSubmit={(event) => { void create(event); }} className="space-y-5" aria-busy={mutation.isPending}>
        <p id={descriptionId} className="text-sm leading-7 text-[var(--text-secondary)]">The new program copies this template’s type, {template.homecell?.name || (template.homecellId ? "assigned homecell" : "church-wide scope")}, activities, times, and responsible people. You can edit those details after creation.</p>
        <div><label htmlFor={dateId} className="mb-2 block text-sm font-semibold">Program date</label><input id={dateId} name="date" type="date" required value={date} onChange={(event) => setDate(event.target.value)} disabled={mutation.isPending || !!createdId} aria-describedby={descriptionId} className="record-input" /><p className="mt-2 text-xs leading-6 text-[var(--text-secondary)]">Choose the calendar date in Malawi. Activity times retain their template values.</p></div>
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-800"><p>{error}</p><Link href="/dashboard/programs" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline">Check program list<span className="sr-only"> (new tab)</span></Link></div>}
        {createdId && <p role="status" className="text-sm leading-7">Program created. <Link href={"/dashboard/programs/" + encodeURIComponent(createdId)} className="font-semibold underline">Open the new program</Link></p>}
        <div className="flex flex-wrap gap-3"><button type="submit" className="record-button record-button-primary" disabled={mutation.isPending || refreshing || !date || !!createdId}>{mutation.isPending ? <InlineLoader message="Creating program…" /> : createdId ? "Program created" : refreshing ? "Checking template…" : "Create program"}</button><button type="button" disabled={mutation.isPending} onClick={() => setOpen(false)} className="record-button record-button-secondary">{createdId ? "Close" : "Cancel"}</button></div>
      </form>
    </Dialog>
  </>;
}
