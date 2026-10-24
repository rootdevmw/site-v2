"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useCreateEventEditorType, useEventEditorTypes, useSaveEventEditor } from "@/lib/hooks/useEventEditor";
import { useMemberEditorOptions } from "@/lib/hooks/useMemberEditorOptions";
import { eventEditorDefaults, eventEditorFailure, eventEditorPayload, eventSchema, type EventEditorValues } from "@/lib/utils/event-editor";
import { RecordFeedback, RecordSection } from "@/components/records/RecordLayout";
import { RecordRichText } from "@/components/records/RecordRichText";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";

type Option = { id: string; name: string };
export function EventTypeCreator({ disabled, onBusyChange, onCreated }: { disabled: boolean; onBusyChange: (value: boolean) => void; onCreated: (value: Option) => void }) {
  const actor = useAuthStore((state) => state.user);
  const mutation = useCreateEventEditorType();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const pending = useRef(false);
  async function create() {
    if (pending.current || disabled || !hasRequiredRole(actor?.roles ?? [], ["DEACON"])) return;
    if (!name.trim() || name.trim().length > 191) { setError("Enter a type name from 1 to 191 characters."); return; }
    pending.current = true; onBusyChange(true); setError("");
    try { const result = await mutation.mutateAsync(name.trim()); onCreated(result); setName(""); }
    catch (failure) { setError(eventEditorFailure(failure, true, true)); }
    finally { pending.current = false; onBusyChange(false); }
  }
  return <details className="mt-4"><summary className="directory-text-link">Add an event type</summary><div className="member-form-field mt-4"><label htmlFor="event-new-type">New type name</label><input id="event-new-type" className="record-input" value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void create(); } }} maxLength={191} disabled={disabled || mutation.isPending} aria-invalid={!!error} aria-describedby="event-new-type-help" /><p id="event-new-type-help" className={error ? "member-form-error" : "member-form-help"} role={error ? "alert" : undefined}>{error || "Create a reusable category, then save the event separately."}</p><div><button type="button" className="record-button record-button-secondary" disabled={disabled || mutation.isPending} onClick={() => { void create(); }}>{mutation.isPending ? <InlineLoader message="Creating type..." /> : "Create type"}</button></div></div></details>;
}

export function EventForm({ mode = "create", initialData, initialType, initialMinistries = [], onDelete }: { mode?: "create" | "edit" | "view"; initialData?: Partial<EventEditorValues> & { id?: string }; initialType?: Option | null; initialMinistries?: Option[]; onDelete?: () => Promise<unknown> }) {
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const router = useRouter();
  const mutation = useSaveEventEditor();
  const types = useEventEditorTypes(actor);
  const ministries = useMemberEditorOptions("ministries", actor);
  const form = useForm<EventEditorValues>({ resolver: zodResolver(eventSchema), defaultValues: eventEditorDefaults(initialData) });
  const { errors, isDirty, dirtyFields, isSubmitting } = form.formState;
  const [typeId, ministryIds, description] = useWatch({ control: form.control, name: ["typeId", "ministryIds", "description"] });
  const [createdType, setCreatedType] = useState<Option | null>(null);
  const [search, setSearch] = useState("");
  const [saveError, setSaveError] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [typeBusy, setTypeBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false), uploading = useRef(false), creatingType = useRef(false), deleting = useRef(false);
  const summary = useRef<HTMLDivElement>(null);
  const busy = mutation.isPending || isSubmitting || uploadBusy || typeBusy || deleteBusy;
  const isView = mode === "view", disabled = busy || isView;
  const backHref = "/dashboard/events" + (mode !== "create" && initialData?.id ? "/" + encodeURIComponent(initialData.id) : "");
  const setMediaBusy = useCallback((value: boolean) => { uploading.current = value; setUploadBusy(value); }, []);
  const setCategoryBusy = useCallback((value: boolean) => { creatingType.current = value; setTypeBusy(value); }, []);
  useEffect(() => { if (!isDirty) return; const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [isDirty]);
  useEffect(() => { if (attempt) summary.current?.focus(); }, [attempt]);
  async function save(values: EventEditorValues) {
    if (submitting.current || uploading.current || creatingType.current || deleting.current || !permitted || isView) return;
    if (mode === "edit" && !initialData?.id) { setSaveError("This event has no record ID. Reopen it from the events list."); setAttempt((value) => value + 1); return; }
    submitting.current = true; setSaveError("");
    try {
      const create = mode === "create";
      const data = eventEditorPayload(values, { ministries: create || !!dirtyFields.ministryIds, type: create || !!dirtyFields.typeId, start: create || !!dirtyFields.startTime, end: create || !!dirtyFields.endTime });
      const response = await mutation.mutateAsync({ id: create ? undefined : initialData?.id, data });
      form.reset(values); router.push("/dashboard/events/" + encodeURIComponent(response.data.id));
    } catch (error) { setSaveError(eventEditorFailure(error, mode === "create")); setAttempt((value) => value + 1); }
    finally { submitting.current = false; }
  }
  const typeOptions = new Map((types.data ?? []).map((entry) => [entry.id, entry]));
  if (createdType) typeOptions.set(createdType.id, createdType);
  if (typeId && !typeOptions.has(typeId)) typeOptions.set(typeId, { id: typeId, name: initialType?.id === typeId ? initialType.name : "Current type #" + typeId });
  const selected = new Set(ministryIds ?? []);
  const ministryOptions = new Map((ministries.data ?? []).map((entry) => [entry.id, entry]));
  for (const id of selected) if (!ministryOptions.has(id)) ministryOptions.set(id, { id, name: initialMinistries.find((entry) => entry.id === id)?.name || "Current ministry #" + id });
  const shown = [...ministryOptions.values()].filter((entry) => selected.has(entry.id) || entry.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const labels: Record<string, string> = { title: "Title", location: "Location", typeId: "Event type", startTime: "Start", endTime: "End", ministryIds: "Ministries", description: "Description" };
  const entries = Object.entries(errors).filter((entry) => !!entry[1]?.message);
  const attributes = (field: keyof EventEditorValues) => ({ id: "event-" + field, className: "record-input", disabled, "aria-invalid": !!errors[field], "aria-describedby": errors[field] ? "event-" + field + "-error" : undefined });
  if (!permitted) return <RecordFeedback kind="forbidden" entity="Event editor" backHref="/dashboard" backLabel="Return to dashboard" />;
  return <article className="record-page member-workspace" aria-labelledby="event-editor-title">
    <Link href={backHref} className="record-back">Back to {mode === "create" ? "events" : "event"}</Link>
    <header className="record-header"><div><p className="record-eyebrow">Church gatherings{initialData?.id ? " · #" + initialData.id : ""}</p><h1 id="event-editor-title" className="record-title">{mode === "create" ? "Plan an event" : mode === "view" ? initialData?.title : "Edit event"}</h1><p className="record-description">Help people know when to gather, where to go and how to take part.</p></div></header>
    <form className="member-editor mt-6" aria-label={mode === "edit" ? "Edit event" : "Create event"} aria-busy={busy} noValidate onSubmit={form.handleSubmit(save, () => setAttempt((value) => value + 1))}>
      <p className="member-form-help">Fields marked * are required.{mode === "edit" && " Renaming keeps the existing public web address."}</p>
      {(entries.length > 0 || saveError) && <div className="member-form-summary" ref={summary} tabIndex={-1} role="alert"><h2>{saveError ? "Save not confirmed" : "Check the highlighted fields"}</h2>{saveError && <p>{saveError}</p>}{entries.length > 0 && <ul>{entries.map(([key, error]) => <li key={key}><a href={"#event-" + key} onClick={(event) => { event.preventDefault(); document.getElementById("event-" + key)?.focus(); }}>{labels[key] || key}: {String(error?.message)}</a></li>)}</ul>}{saveError && <Link href={backHref} className="directory-text-link">Review saved {mode === "create" ? "events" : "event"}</Link>}</div>}
      <RecordSection title="Event essentials" description="Use a welcoming title and a location suitable for the public event listing."><div className="member-form-grid">
        <div className="member-form-field"><label htmlFor="event-title">Title *</label><input {...form.register("title")} {...attributes("title")} required maxLength={191} autoComplete="off" />{errors.title && <p id="event-title-error" className="member-form-error">{errors.title.message}</p>}</div>
        <div className="member-form-field"><label htmlFor="event-location">Location</label><input {...form.register("location")} {...attributes("location")} maxLength={191} placeholder="Venue, area or online meeting location" />{errors.location && <p id="event-location-error" className="member-form-error">{errors.location.message}</p>}</div>
        <div className="member-form-field"><label htmlFor="event-typeId">Event type *</label><select {...form.register("typeId")} {...attributes("typeId")} disabled={disabled || types.isPending || types.isError} required><option value="">Choose an event type</option>{[...typeOptions.values()].map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select>{errors.typeId && <p id="event-typeId-error" className="member-form-error">{errors.typeId.message}</p>}{types.isPending ? <p className="member-form-help" role="status">Loading event types...</p> : types.isError ? <p className="member-form-error" role="alert">Event types could not be loaded. The current choice is kept. <button type="button" className="directory-text-link" disabled={busy} onClick={() => { void types.refetch(); }}>Reload types</button></p> : !types.data?.length && <p className="member-form-help">No event types are available. Add one below to continue.</p>}{!isView && <EventTypeCreator disabled={disabled} onBusyChange={setCategoryBusy} onCreated={(entry) => { setCreatedType(entry); form.setValue("typeId", entry.id, { shouldDirty: true, shouldValidate: true }); }} />}</div>
      </div></RecordSection>
      <RecordSection title="When we gather" description="All dates and times use Malawi time (CAT, UTC+02:00), wherever you are editing."><div className="member-form-grid">{(["startTime", "endTime"] as const).map((field) => <div className="member-form-field" key={field}><label htmlFor={"event-" + field}>{field === "startTime" ? "Starts" : "Ends"} *</label><input {...form.register(field)} {...attributes(field)} type="datetime-local" step="0.001" required aria-describedby={"event-time-help" + (errors[field] ? " event-" + field + "-error" : "")} />{errors[field] && <p id={"event-" + field + "-error"} className="member-form-error">{errors[field].message}</p>}</div>)}</div><p id="event-time-help" className="member-form-help mt-4">Choose an end time after the start. Events may continue into the next day.</p></RecordSection>
      <RecordSection title="Ministries taking part" description="Link the ministries involved in this gathering. Leaving this empty creates no ministry links; it does not select all ministries."><fieldset id="event-ministryIds" tabIndex={-1} className="member-form-field member-ministry-field" disabled={disabled || ministries.isPending || ministries.isError} aria-describedby={errors.ministryIds ? "event-ministryIds-error" : undefined}><legend>{selected.size} selected</legend><label htmlFor="event-ministry-search" className="member-form-help">Find a ministry. Selected ministries remain visible.</label><input id="event-ministry-search" type="search" className="record-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ministries" /><div className="member-ministry-choices">{shown.map((entry) => <label key={entry.id}><input type="checkbox" checked={selected.has(entry.id)} onChange={() => { const next = new Set(form.getValues("ministryIds")); if (next.has(entry.id)) next.delete(entry.id); else next.add(entry.id); form.setValue("ministryIds", [...next], { shouldDirty: true, shouldValidate: true }); }} /><span>{entry.name}</span></label>)}</div></fieldset>
        {errors.ministryIds && <p id="event-ministryIds-error" className="member-form-error">{errors.ministryIds.message || "Review the selected ministries."}</p>}{ministries.isPending ? <p className="member-form-help" role="status">Loading ministries...</p> : ministries.isError ? <p className="member-form-error" role="alert">Ministries could not be loaded. Current links are kept. <button type="button" className="directory-text-link" disabled={busy} onClick={() => { void ministries.refetch(); }}>Reload ministries</button></p> : !shown.length && <p className="member-form-help">{search ? "No ministries match this search." : "No ministries are available yet."}</p>}
      </RecordSection>
      <RecordSection title="Invitation and details" description="Explain who the event is for, what to expect and anything people should bring.">{isView ? <RecordRichText content={description} emptyMessage="No description has been added." /> : <RichTextEditor id="event-description" label="Description" value={description} onChange={(value) => form.setValue("description", value, { shouldDirty: true, shouldValidate: true })} disabled={disabled} error={errors.description?.message} onBusyChange={setMediaBusy} editorHeightClassName="h-[clamp(12rem,40dvh,25rem)]" />}</RecordSection>
      <footer className="member-form-footer"><p className="member-form-help">{isDirty ? "You have unsaved changes." : "Review the invitation and schedule before saving."}</p><div><button type="button" className="record-button record-button-secondary" disabled={busy} onClick={() => { if (isDirty) setDiscarding(true); else router.push(backHref); }}>{isView ? "Back" : "Cancel"}</button>{!isView && <button type="submit" className="record-button record-button-primary" disabled={busy}>{busy ? <InlineLoader message={uploadBusy ? "Waiting for media upload..." : typeBusy ? "Creating type..." : "Saving..."} /> : mode === "edit" ? "Save changes" : "Create event"}</button>}</div></footer>
      {mode === "edit" && onDelete && <details className="record-more-actions"><summary className="directory-text-link">Other event actions</summary><RecordActionDialog secondary actionKey={"event:delete:" + initialData?.id} label="Delete event" title={"Delete event #" + initialData?.id + "?"} description="Remove this event from the active listing. Unsaved edits will not be saved." pendingLabel="Deleting..." successMessage="Deletion confirmed." busy={busy} onConfirm={async () => { if (submitting.current || uploading.current || creatingType.current || deleting.current || !permitted) throw new Error("Another event action is in progress."); deleting.current = true; setDeleteBusy(true); try { await onDelete(); } finally { deleting.current = false; setDeleteBusy(false); } }} /></details>}
      <Dialog open={discarding} onClose={() => setDiscarding(false)} title="Leave unsaved changes?" description="Your entries have not been saved to this event."><div className="member-form-actions"><button type="button" className="record-button record-button-primary" onClick={() => { form.reset(); router.push(backHref); }}>Leave without saving</button><button type="button" className="record-button record-button-secondary" onClick={() => setDiscarding(false)}>Keep editing</button></div></Dialog>
    </form>
  </article>;
}
