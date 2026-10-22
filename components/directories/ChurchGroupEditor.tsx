"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useSaveGroupEditor } from "@/lib/hooks/useGroupEditor";
import { groupEditorDefaults, groupEditorFailure, groupEditorInfo, groupEditorPayload, groupEditorSchema, type GroupEditorValues } from "@/lib/utils/group-editor";
import type { GroupKind } from "@/lib/utils/group-members";
import type { RelatedRecord } from "@/lib/utils/record-details";
import { RecordFeedback, RecordSection } from "@/components/records/RecordLayout";
import { RecordRichText } from "@/components/records/RecordRichText";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";
import { GroupLeadershipPicker } from "./GroupLeadershipPicker";

export type ChurchGroupEditorProps = { mode?: "create" | "edit" | "view"; initialData?: Partial<GroupEditorValues> & { id?: string }; initialPeople?: { leader?: RelatedRecord | null; overseer?: RelatedRecord | null }; onDelete?: () => Promise<unknown> };
export function ChurchGroupEditor({ kind, mode = "create", initialData, initialPeople, onDelete }: ChurchGroupEditorProps & { kind: GroupKind }) {
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const info = groupEditorInfo[kind];
  const isView = mode === "view";
  const router = useRouter();
  const mutation = useSaveGroupEditor(kind);
  const form = useForm<GroupEditorValues>({ resolver: zodResolver(groupEditorSchema(kind)), defaultValues: groupEditorDefaults(initialData) });
  const { errors, isDirty, dirtyFields, isSubmitting } = form.formState;
  const [leaderId, overseerId, description] = useWatch({ control: form.control, name: ["leaderId", "overseerId", "description"] });
  const [saveError, setSaveError] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const submitting = useRef(false);
  const uploading = useRef(false);
  const deleting = useRef(false);
  const summary = useRef<HTMLDivElement>(null);
  const busy = mutation.isPending || isSubmitting || uploadBusy || deleteBusy;
  const disabled = busy || isView;
  const backHref = "/dashboard/" + info.plural + (mode !== "create" && initialData?.id ? "/" + encodeURIComponent(initialData.id) : "");
  const setMediaBusy = useCallback((value: boolean) => { uploading.current = value; setUploadBusy(value); }, []);
  useEffect(() => { if (!isDirty) return; const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [isDirty]);
  useEffect(() => { if (validationAttempt) summary.current?.focus(); }, [validationAttempt]);
  async function save(values: GroupEditorValues) {
    if (submitting.current || uploading.current || deleting.current || !permitted || isView) return;
    if (mode === "edit" && !initialData?.id) { setSaveError("This group has no record ID. Reopen it from the directory."); setValidationAttempt((count) => count + 1); return; }
    submitting.current = true; setSaveError("");
    try {
      const data = groupEditorPayload(kind, values, { leader: mode === "create" || !!dirtyFields.leaderId, overseer: mode === "create" || !!dirtyFields.overseerId });
      const response = await mutation.mutateAsync({ id: mode === "edit" ? initialData?.id : undefined, data });
      form.reset(values); router.push("/dashboard/" + info.plural + "/" + encodeURIComponent(response.data.id));
    } catch (error) { setSaveError(groupEditorFailure(error, mode === "create")); setValidationAttempt((count) => count + 1); }
    finally { submitting.current = false; }
  }
  const labels: Record<string, string> = { name: "Name", purpose: "Purpose", location: "Location", leaderId: "Leader", overseerId: "Overseer", description: "Description" };
  const entries = Object.entries(errors).filter((entry) => !!entry[1]?.message);
  const attributes = (field: keyof GroupEditorValues) => ({ id: "group-" + field, className: "record-input", disabled, "aria-invalid": !!errors[field], "aria-describedby": errors[field] ? "group-" + field + "-error" : undefined });
  if (!permitted) return <RecordFeedback kind="forbidden" entity={info.title + " editor"} backHref="/dashboard" backLabel="Return to dashboard" />;
  return <article className="record-page member-workspace" aria-labelledby="group-editor-title"><Link href={backHref} className="record-back">Back to {mode === "create" ? info.plural : info.singular}</Link><header className="record-header"><div><p className="record-eyebrow">Church communities{initialData?.id ? " · #" + initialData.id : ""}</p><h1 id="group-editor-title" className="record-title">{mode === "create" ? "Add a " + info.singular : mode === "view" ? initialData?.name || info.title : "Edit " + (initialData?.name || info.singular)}</h1><p className="record-description">{info.description}</p></div></header>
    <form className="member-editor mt-6" aria-label={(mode === "edit" ? "Edit " : "Create ") + info.singular} aria-busy={busy} noValidate onSubmit={form.handleSubmit(save, () => setValidationAttempt((count) => count + 1))}>
      <p className="member-form-help">Fields marked * are required. Leadership can be assigned later.{mode === "edit" && " Renaming keeps the existing public web address."}</p>
      {(entries.length > 0 || saveError) && <div className="member-form-summary" role="alert" tabIndex={-1} ref={summary}><h2>{saveError ? "Save not confirmed" : "Check the highlighted fields"}</h2>{saveError && <p>{saveError}</p>}{entries.length > 0 && <ul>{entries.map(([key, error]) => <li key={key}><a href={"#group-" + key} onClick={(event) => { event.preventDefault(); document.getElementById("group-" + key)?.focus(); }}>{labels[key] || key}: {String(error?.message)}</a></li>)}</ul>}{saveError && <Link href={backHref} className="directory-text-link">Review saved {mode === "create" ? info.plural : info.singular}</Link>}</div>}
      <RecordSection title={"About this " + info.singular} description="Use clear details that are suitable for the public church listing."><div className="member-form-grid"><div className="member-form-field"><label htmlFor="group-name">Name *</label><input {...form.register("name")} {...attributes("name")} required maxLength={191} autoComplete="off" />{errors.name && <p id="group-name-error" className="member-form-error">{errors.name.message}</p>}</div>{kind === "ministry" ? <div className="member-form-field"><label htmlFor="group-purpose">Purpose *</label><textarea {...form.register("purpose")} {...attributes("purpose")} required maxLength={191} rows={2} placeholder="Who this ministry serves and why" />{errors.purpose && <p id="group-purpose-error" className="member-form-error">{errors.purpose.message}</p>}</div> : <div className="member-form-field"><label htmlFor="group-location">Location</label><input {...form.register("location")} {...attributes("location")} maxLength={191} placeholder="Area or meeting location" /><p className="member-form-help">Use a location suitable for public listing, or leave it blank until confirmed.</p>{errors.location && <p id="group-location-error" className="member-form-error">{errors.location.message}</p>}</div>}</div></RecordSection>
      <RecordSection title="Leadership" description={kind === "homecell" ? "Choose different directory profiles for leader and overseer, or leave either role unassigned." : "Choose the people who guide and support this ministry, or leave the roles unassigned."}><div className="member-form-grid"><GroupLeadershipPicker id="group-leaderId" label="Leader" value={leaderId} initialPerson={initialPeople?.leader} actor={actor} disabled={disabled} error={errors.leaderId?.message} onChange={(value) => form.setValue("leaderId", value, { shouldDirty: true, shouldValidate: true })} /><GroupLeadershipPicker id="group-overseerId" label="Overseer" value={overseerId} initialPerson={initialPeople?.overseer} actor={actor} disabled={disabled} error={errors.overseerId?.message} onChange={(value) => form.setValue("overseerId", value, { shouldDirty: true, shouldValidate: true })} /></div><p className="member-form-help mt-4">Leadership assignments do not change account roles or add people to the group. Manage group membership from its detail page.</p></RecordSection>
      {kind === "ministry" && <RecordSection title="Ministry story" description="Explain what people can expect and how they can take part. This description can appear on the public ministry page.">{isView ? <RecordRichText content={description} emptyMessage="No description has been added." /> : <RichTextEditor id="group-description" label="Description" value={description} disabled={disabled} onChange={(value) => form.setValue("description", value, { shouldDirty: true, shouldValidate: true })} error={errors.description?.message} onBusyChange={setMediaBusy} editorHeightClassName="h-[clamp(12rem,40dvh,25rem)]" />}</RecordSection>}
      <footer className="member-form-footer"><p className="member-form-help">{isDirty ? "You have unsaved changes." : "Save when you have finished reviewing the details."}</p><div><button type="button" className="record-button record-button-secondary" disabled={busy} onClick={() => { if (isDirty) setDiscarding(true); else router.push(backHref); }}>{isView ? "Back" : "Cancel"}</button>{!isView && <button type="submit" className="record-button record-button-primary" disabled={busy}>{busy ? <InlineLoader message={uploadBusy ? "Waiting for media upload…" : "Saving…"} /> : mode === "edit" ? "Save changes" : "Create " + info.singular}</button>}</div></footer>
      {mode === "edit" && onDelete && <details className="record-more-actions"><summary className="directory-text-link">Other group actions</summary><RecordActionDialog secondary actionKey={kind + ":delete:" + initialData?.id} label={"Delete " + info.singular} title={"Delete " + info.singular + " #" + initialData?.id + "?"} description="Remove this group from the active directory. Unsaved edits will not be saved. Review linked members, events and programs before continuing." confirmLabel={"Delete " + info.singular} pendingLabel="Deleting…" successMessage="Deletion confirmed." busy={busy} onConfirm={async () => { if (submitting.current || deleting.current || uploading.current || !permitted) throw new Error("Another group action is in progress."); deleting.current = true; setDeleteBusy(true); try { await onDelete(); } finally { deleting.current = false; setDeleteBusy(false); } }} /></details>}
      <Dialog open={discarding} onClose={() => setDiscarding(false)} title="Leave unsaved changes?" description="Your entries have not been saved to this group."><div className="member-form-actions"><button type="button" className="record-button record-button-primary" onClick={() => { form.reset(); router.push(backHref); }}>Leave without saving</button><button type="button" className="record-button record-button-secondary" onClick={() => setDiscarding(false)}>Keep editing</button></div></Dialog>
    </form>
  </article>;
}
