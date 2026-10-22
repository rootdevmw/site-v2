"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { memberSchema, type MemberFormValues } from "../types/member.types";
import { useCreateMember } from "../hooks/useCreateMember";
import { useUpdateMember } from "../hooks/useUpdateMember";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useMemberEditorOptions } from "@/lib/hooks/useMemberEditorOptions";
import { uploadMemberPhoto } from "@/lib/api/member-editor";
import { memberEditorDefaults, memberEditorPayload, memberPhotoError, memberSaveError } from "@/lib/utils/member-editor";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RecordAvatar } from "@/components/records/RecordAvatar";
import { RecordFeedback, RecordSection } from "@/components/records/RecordLayout";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import type { RelatedRecord } from "@/lib/utils/record-details";

function Field({ id, label, error, help, children }: { id: string; label: string; error?: string; help?: string; children: ReactNode }) {
  return <div className="member-form-field"><label htmlFor={id}>{label}</label>{children}{help && <p id={id + "-help"} className="member-form-help">{help}</p>}{error && <p id={id + "-error"} className="member-form-error">{error}</p>}</div>;
}

export function MemberForm({ mode = "create", initialData, initialConnections, onBusyChange, onDelete }: { mode?: "create" | "edit" | "view"; initialData?: Partial<MemberFormValues> & { id?: string }; initialConnections?: { homecell?: RelatedRecord | null; ministries: RelatedRecord[] }; onBusyChange?: (busy: boolean) => void; onDelete?: () => Promise<unknown> }) {
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const router = useRouter();
  const create = useCreateMember();
  const update = useUpdateMember();
  const homecells = useMemberEditorOptions("homecells", actor);
  const ministries = useMemberEditorOptions("ministries", actor);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const [ministrySearch, setMinistrySearch] = useState("");
  const photoInFlight = useRef(false);
  const biographyInFlight = useRef(false);
  const saving = useRef(false);
  const deleting = useRef(false);
  const errorSummary = useRef<HTMLDivElement>(null);
  const [validationAttempt, setValidationAttempt] = useState(0);
  const form = useForm<MemberFormValues>({ resolver: zodResolver(memberSchema), defaultValues: memberEditorDefaults(initialData) });
  const { errors, isDirty, dirtyFields, isSubmitting } = form.formState;
  const [isBaptized, imageUrl, firstName, lastName, ministryIds, homecellId, bio] = useWatch({ control: form.control, name: ["isBaptized", "imageUrl", "firstName", "lastName", "ministryIds", "homecellId", "bio"] });
  const busy = create.isPending || update.isPending || photoBusy || bioBusy || isSubmitting || deleteBusy;
  const isView = mode === "view";
  const disabled = busy || isView;
  const backHref = mode === "edit" && initialData?.id ? "/dashboard/members/" + encodeURIComponent(initialData.id) : "/dashboard/members";
  const bioBusyChanged = useCallback((pending: boolean) => { biographyInFlight.current = pending; setBioBusy(pending); }, []);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  useEffect(() => { if (!isDirty) return; const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [isDirty]);
  useEffect(() => { if (validationAttempt) errorSummary.current?.focus(); }, [validationAttempt]);
  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || photoInFlight.current || saving.current || deleting.current || !permitted) return;
    const failure = memberPhotoError(file);
    setPhotoError(failure); setPhotoMessage("");
    if (failure) return;
    photoInFlight.current = true; setPhotoBusy(true);
    try { const url = await uploadMemberPhoto(file); form.setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true }); setPhotoMessage("Photo uploaded. Save the profile to keep this change."); }
    catch { setPhotoError("The upload could not be confirmed. Your previous photo is kept. Try uploading again before saving a replacement."); }
    finally { photoInFlight.current = false; setPhotoBusy(false); }
  }
  async function submit(values: MemberFormValues) {
    if (saving.current || deleting.current || photoInFlight.current || biographyInFlight.current || !permitted || isView) return;
    if (mode === "edit" && !initialData?.id) { setSaveError("The member ID is missing. Return to the directory and reopen the profile."); return; }
    if (dirtyFields.homecellId && (homecells.isError || homecells.isPending) || dirtyFields.ministryIds && (ministries.isError || ministries.isPending)) { setSaveError("Reload the church connection choices before saving assignment changes. Your entries are kept."); return; }
    saving.current = true; setSaveError("");
    try {
      const data = memberEditorPayload(values, { homecell: mode === "create" || !!dirtyFields.homecellId, ministries: mode === "create" || !!dirtyFields.ministryIds });
      const response = mode === "edit" ? await update.mutateAsync({ id: initialData!.id!, data }) : await create.mutateAsync(data);
      form.reset(values); router.push("/dashboard/members/" + encodeURIComponent(response.data.id));
    } catch (error) { setSaveError(memberSaveError(error, mode === "create")); setValidationAttempt((count) => count + 1); }
    finally { saving.current = false; }
  }
  function cancel() { if (busy) return; if (isDirty) setDiscarding(true); else router.push(backHref); }
  const name = [firstName, lastName].filter(Boolean).join(" ").trim() || "New member";
  const selectedMinistries = new Set(ministryIds ?? []);
  const ministryOptions = new Map((ministries.data ?? []).map((entry) => [entry.id, entry]));
  for (const id of selectedMinistries) if (!ministryOptions.has(id)) ministryOptions.set(id, { id, name: initialConnections?.ministries.find((entry) => entry.id === id)?.name || "Current ministry #" + id });
  const shownMinistries = [...ministryOptions.values()].filter((entry) => selectedMinistries.has(entry.id) || entry.name.toLocaleLowerCase().includes(ministrySearch.toLocaleLowerCase()));
  const labels: Partial<Record<keyof MemberFormValues, string>> = { prefix: "Church title", firstName: "First name", lastName: "Last name", phone: "Phone", status: "Membership status", baptismDate: "Baptism date", imageUrl: "Photo", location: "Location", ministryIds: "Ministries", homecellId: "Homecell", bio: "Biography" };
  const entries = Object.entries(errors).filter((entry) => !!entry[1]?.message);
  const inputProps = (key: keyof MemberFormValues) => ({ id: "member-" + key, className: "record-input", disabled, "aria-invalid": !!errors[key], "aria-describedby": errors[key] ? "member-" + key + "-error" : undefined });
  if (!permitted) return <RecordFeedback kind="forbidden" entity="Member form" backHref="/dashboard" backLabel="Return to dashboard" />;
  return <form className="member-editor" noValidate onSubmit={form.handleSubmit(submit, () => setValidationAttempt((count) => count + 1))} aria-label={mode === "edit" ? "Edit member profile" : "Create member profile"} aria-busy={busy}>
    <p className="member-form-help">Fields marked * are required. Phone, photograph, biography and church connections can be added later.</p>
    {(entries.length > 0 || saveError) && <div ref={errorSummary} tabIndex={-1} role="alert" className="member-form-summary"><h2>{saveError ? "Save not confirmed" : "Check the highlighted fields"}</h2>{saveError && <p>{saveError}</p>}{entries.length > 0 && <ul>{entries.map(([key, error]) => <li key={key}><a href={"#member-" + key} onClick={(event) => { event.preventDefault(); document.getElementById("member-" + key)?.focus(); }}>{labels[key as keyof MemberFormValues] || key}: {String(error?.message)}</a></li>)}</ul>}{saveError && <Link href={backHref} className="directory-text-link">Review {mode === "create" ? "member directory" : "saved profile"}</Link>}</div>}
    <RecordSection title="Personal details" description="The name and contact details used in the church directory."><div className="member-form-grid">
      <Field id="member-firstName" label="First name *" error={errors.firstName?.message}><input {...form.register("firstName")} {...inputProps("firstName")} autoComplete="given-name" maxLength={191} required /></Field>
      <Field id="member-lastName" label="Last name *" error={errors.lastName?.message}><input {...form.register("lastName")} {...inputProps("lastName")} autoComplete="family-name" maxLength={191} required /></Field>
      <Field id="member-phone" label="Phone" error={errors.phone?.message}><input {...form.register("phone")} {...inputProps("phone")} type="tel" autoComplete="tel" maxLength={191} /></Field>
      <Field id="member-location" label="Location" error={errors.location?.message}><input {...form.register("location")} {...inputProps("location")} autoComplete="address-level2" maxLength={191} placeholder="Area or neighbourhood" /></Field>
    </div></RecordSection>
    <RecordSection title="Church life" description="Record the person's church title, membership and baptism."><div className="member-form-grid">
      <Field id="member-prefix" label="Church title *" error={errors.prefix?.message}><select {...form.register("prefix")} {...inputProps("prefix")} required><option value="">Choose a title</option>{["PASTOR", "ELDER", "DEACON", "SISTER", "BROTHER"].map((value) => <option key={value} value={value}>{value.charAt(0) + value.slice(1).toLowerCase()}</option>)}</select></Field>
      <Field id="member-status" label="Membership status *" error={errors.status?.message}><select {...form.register("status")} {...inputProps("status")} required><option value="">Choose membership status</option><option value="VISITOR">Visitor</option><option value="MEMBER">Member</option></select></Field>
      <fieldset className="member-form-field" disabled={disabled}><legend>Baptism recorded</legend><div className="member-form-choices">{[true, false].map((value) => <label key={String(value)}><input type="radio" name="member-baptism" checked={!!isBaptized === value} onChange={() => { form.setValue("isBaptized", value, { shouldDirty: true }); if (!value) form.setValue("baptismDate", "", { shouldDirty: true, shouldValidate: true }); }} />{value ? "Yes" : "No"}</label>)}</div></fieldset>
      {isBaptized && <Field id="member-baptismDate" label="Baptism date" error={errors.baptismDate?.message} help="Leave blank if the date is not recorded."><input {...form.register("baptismDate")} {...inputProps("baptismDate")} type="date" /></Field>}
    </div></RecordSection>
    <RecordSection title="Church connections" description="Assign a homecell and the ministries this person belongs to."><div className="member-form-grid">
      <Field id="member-homecellId" label="Homecell" error={errors.homecellId?.message}><select {...form.register("homecellId")} {...inputProps("homecellId")} disabled={disabled || homecells.isPending || homecells.isError}><option value="">No homecell assigned</option>{homecellId && !homecells.data?.some((entry) => entry.id === homecellId) && <option value={homecellId}>{initialConnections?.homecell?.name || "Current homecell #" + homecellId}</option>}{homecells.data?.map((entry) => <option value={entry.id} key={entry.id}>{entry.name}</option>)}</select></Field>
      <div className="member-form-help">{homecells.isPending ? <p role="status">Loading homecells…</p> : homecells.isError ? <p role="alert">Homecells could not be loaded. The current assignment is kept. <button type="button" className="directory-text-link" disabled={busy} onClick={() => { void homecells.refetch(); }}>Reload homecells</button></p> : <p>{homecells.data?.length || 0} homecells available. Choose “No homecell assigned” to clear the current assignment.</p>}</div>
    </div>
      <fieldset className="member-form-field member-ministry-field" disabled={disabled || ministries.isPending || ministries.isError}><legend>Ministries · {selectedMinistries.size} selected</legend><label htmlFor="member-ministry-search" className="member-form-help">Find a ministry. Selected ministries remain visible.</label><input id="member-ministry-search" type="search" className="record-input" value={ministrySearch} onChange={(event) => setMinistrySearch(event.target.value)} placeholder="Search ministries" /><div className="member-ministry-choices">{shownMinistries.map((entry) => <label key={entry.id}><input type="checkbox" checked={selectedMinistries.has(entry.id)} onChange={() => { const next = new Set(form.getValues("ministryIds") ?? []); if (next.has(entry.id)) next.delete(entry.id); else next.add(entry.id); form.setValue("ministryIds", [...next], { shouldDirty: true, shouldValidate: true }); }} /><span>{entry.name}</span></label>)}</div></fieldset>
      {ministries.isPending ? <p className="member-form-help" role="status">Loading ministries…</p> : ministries.isError ? <p className="member-form-error" role="alert">Ministries could not be loaded. Current assignments are kept. <button type="button" className="directory-text-link" disabled={busy} onClick={() => { void ministries.refetch(); }}>Reload ministries</button></p> : !shownMinistries.length && <p className="member-form-help">{ministrySearch ? "No ministries match this search." : "No ministries are available yet."}</p>}
    </RecordSection>
    <RecordSection title="Photograph" description="Add a clear portrait to help people recognize this member."><div className="member-photo-row"><RecordAvatar name={name} initials={[firstName, lastName].map((value) => value?.trim().charAt(0)).join("")} imageUrl={imageUrl} /><div className="member-form-field"><label htmlFor="member-imageUrl">Choose photograph</label><input id="member-imageUrl" type="file" accept="image/jpeg,image/png,image/webp" className="record-input" disabled={disabled} onChange={(event) => { void uploadPhoto(event); }} aria-describedby="member-photo-help" /><p id="member-photo-help" className="member-form-help">JPEG, PNG or WebP, up to 5 MB. Uploading stores the file; save the profile to attach it.</p>{imageUrl && <button type="button" className="directory-text-link" disabled={disabled} onClick={() => { form.setValue("imageUrl", "", { shouldDirty: true }); setPhotoMessage("Photo will be removed when you save the profile."); }}>Remove photograph</button>}{photoBusy && <p role="status"><InlineLoader message="Uploading photograph…" /></p>}{photoMessage && <p role="status" className="member-form-help">{photoMessage}</p>}{photoError && <p role="alert" className="member-form-error">{photoError}</p>}{errors.imageUrl && <p id="member-imageUrl-error" className="member-form-error">{errors.imageUrl.message}</p>}</div></div></RecordSection>
    <RecordSection title="Biography" description="Share a little about this person. Biographies and photographs may appear on public leadership pages."><RichTextEditor id="member-bio" label="Member biography" value={bio} onChange={(value) => form.setValue("bio", value, { shouldDirty: true, shouldValidate: true })} disabled={disabled} onBusyChange={bioBusyChanged} error={errors.bio?.message} editorHeightClassName="h-[clamp(12rem,40dvh,25rem)]" /></RecordSection>
    <footer className="member-form-footer"><p className="member-form-help">{isDirty ? "You have unsaved changes." : "Changes are saved when you submit this profile."}</p><div><button type="button" className="record-button record-button-secondary" disabled={busy} onClick={cancel}>{isView ? "Back" : "Cancel"}</button>{!isView && <button type="submit" className="record-button record-button-primary" disabled={busy}>{busy ? <InlineLoader message={photoBusy || bioBusy ? "Waiting for uploads…" : "Saving profile…"} /> : mode === "edit" ? "Save changes" : "Create member"}</button>}</div></footer>
    {mode === "edit" && onDelete && <details className="record-more-actions"><summary className="directory-text-link">Other profile actions</summary><RecordActionDialog secondary actionKey={"delete-member:" + initialData?.id} label="Delete profile" title={"Delete member profile #" + initialData?.id + "?"} description="Remove this profile from the active directory. Unsaved edits will not be saved. Review linked church records before continuing." confirmLabel="Delete profile" pendingLabel="Deleting profile…" successMessage="Deletion confirmed." busy={busy} onConfirm={async () => { if (deleting.current || saving.current || photoInFlight.current || biographyInFlight.current || !permitted) throw new Error("A profile action is already in progress."); deleting.current = true; setDeleteBusy(true); try { await onDelete(); } finally { deleting.current = false; setDeleteBusy(false); } }} /></details>}
    <Dialog open={discarding} onClose={() => setDiscarding(false)} title="Leave unsaved changes?" description="Your entries have not been saved to this profile."><div className="member-form-actions"><button type="button" className="record-button record-button-primary" onClick={() => { form.reset(); router.push(backHref); }}>Leave without saving</button><button type="button" className="record-button record-button-secondary" onClick={() => setDiscarding(false)}>Keep editing</button></div></Dialog>
  </form>;
}
