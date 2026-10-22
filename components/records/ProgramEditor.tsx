"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import {
  useProgramEditorTypes,
  useSaveProgramEditor,
} from "@/lib/hooks/useProgramEditor";
import { useMemberEditorOptions } from "@/lib/hooks/useMemberEditorOptions";
import {
  programEditorDefaults,
  programEditorFailure,
  programEditorPayload,
  programEditorSchema,
  programFieldErrors,
  templateDraft,
  type ProgramEditorKind,
  type ProgramEditorValues,
} from "@/lib/utils/program-editor";
import type { RelatedRecord } from "@/lib/utils/record-details";
import { GroupLeadershipPicker } from "@/components/directories/GroupLeadershipPicker";
import { ProgramTypeForm } from "@/app/modules/programs/components/ProgramTypeForm";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";
import { RecordFeedback, RecordSection } from "./RecordLayout";
import { RecordActionDialog } from "./RecordActionDialog";
import { ProgramTemplatePicker } from "./ProgramTemplatePicker";

export type ProgramEditorProps = {
  mode?: "create" | "edit" | "view";
  initialData?: Partial<ProgramEditorValues> & { id?: string };
  initialType?: RelatedRecord | null;
  initialHomecell?: RelatedRecord | null;
  initialPeople?: RelatedRecord[];
  onDelete?: () => Promise<unknown>;
  embedded?: boolean;
};
function ActivityFrame({
  id,
  index,
  disabled,
  children,
}: {
  id: string;
  index: number;
  disabled: boolean;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="program-activity"
    >
      <div className="program-activity-heading">
        <h3>Activity {index + 1}</h3>
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          className="record-button record-button-secondary program-drag-handle"
          aria-label={"Drag activity " + (index + 1) + " to reorder"}
        >
          Drag to reorder
        </button>
      </div>
      {children}
    </li>
  );
}
export function ProgramEditor({
  kind,
  mode = "create",
  initialData,
  initialType,
  initialHomecell,
  initialPeople = [],
  onDelete,
  embedded = false,
}: ProgramEditorProps & { kind: ProgramEditorKind }) {
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const router = useRouter();
  const mutation = useSaveProgramEditor(kind),
    copyMutation = useSaveProgramEditor("template");
  const types = useProgramEditorTypes(actor),
    homecells = useMemberEditorOptions("homecells", actor);
  const form = useForm<ProgramEditorValues>({
    resolver: zodResolver(programEditorSchema(kind)),
    defaultValues: programEditorDefaults(initialData),
  });
  const { fields, append, remove, move, replace } = useFieldArray({
    control: form.control,
    name: "items",
    keyName: "editorKey",
  });
  const [items, typeId, homecellId] = useWatch({
    control: form.control,
    name: ["items", "typeId", "homecellId"],
  });
  const { errors, isDirty, dirtyFields, isSubmitting } = form.formState;
  const [saveError, setSaveError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [selectingTemplate, setSelectingTemplate] = useState(false);
  const [addingType, setAddingType] = useState(false);
  const [typeBusy, setTypeBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [createdType, setCreatedType] = useState<RelatedRecord | null>(null);
  const [copiedPeople, setCopiedPeople] = useState<RelatedRecord[]>([]);
  const [copiedHomecell, setCopiedHomecell] = useState<RelatedRecord | null>(
    null,
  );
  const [copying, setCopying] = useState(false);
  const [copyName, setCopyName] = useState("");
  const [copyError, setCopyError] = useState("");
  const [savedCopy, setSavedCopy] = useState("");
  const submitting = useRef(false),
    creatingType = useRef(false),
    savingCopy = useRef(false),
    deleting = useRef(false);
  const summary = useRef<HTMLDivElement>(null);
  const isView = mode === "view",
    busy =
      mutation.isPending ||
      copyMutation.isPending ||
      isSubmitting ||
      typeBusy ||
      deleteBusy,
    disabled = busy || isView;
  const plural = kind === "program" ? "programs" : "program-templates",
    noun = kind === "program" ? "program" : "template";
  const backHref =
    "/dashboard/" +
    plural +
    (mode !== "create" && initialData?.id
      ? "/" + encodeURIComponent(initialData.id)
      : "");
  const Heading = embedded ? "h3" : "h1";
  const setCategoryBusy = useCallback((value: boolean) => {
    creatingType.current = value;
    setTypeBusy(value);
  }, []);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
  useEffect(() => {
    if (attempt) summary.current?.focus();
  }, [attempt]);
  const blocked = () =>
    submitting.current ||
    creatingType.current ||
    savingCopy.current ||
    deleting.current ||
    !permitted ||
    isView;
  async function save(values: ProgramEditorValues) {
    if (blocked()) return;
    if (mode === "edit" && !initialData?.id) {
      setSaveError("This record has no ID. Reopen it from the list.");
      setAttempt((value) => value + 1);
      return;
    }
    submitting.current = true;
    setSaveError("");
    try {
      const changed =
        mode === "edit"
          ? {
              type: !!dirtyFields.typeId,
              homecell: !!dirtyFields.homecellId,
              items: !!dirtyFields.items,
              date: !!dirtyFields.date,
            }
          : undefined;
      const response = await mutation.mutateAsync({
        id: mode === "edit" ? initialData?.id : undefined,
        data: programEditorPayload(kind, values, changed),
      });
      form.reset(values);
      router.push(
        "/dashboard/" + plural + "/" + encodeURIComponent(response.data.id),
      );
    } catch (error) {
      setSaveError(programEditorFailure(error, mode === "create"));
      setAttempt((value) => value + 1);
    } finally {
      submitting.current = false;
    }
  }
  async function saveCopy() {
    if (blocked()) return;
    const parsed = programEditorSchema("template").safeParse(
      templateDraft(form.getValues(), copyName),
    );
    if (!parsed.success) {
      setCopyError(
        parsed.error.issues[0]?.message || "Review the template details.",
      );
      return;
    }
    savingCopy.current = true;
    setCopyError("");
    try {
      const result = await copyMutation.mutateAsync({
        data: programEditorPayload("template", parsed.data),
      });
      setSavedCopy(result.data.id);
      setCopying(false);
      setCopyName("");
    } catch (error) {
      setCopyError(programEditorFailure(error, true));
    } finally {
      savingCopy.current = false;
    }
  }
  function reorder(from: number, to: number) {
    if (
      disabled ||
      from < 0 ||
      to < 0 ||
      from >= fields.length ||
      to >= fields.length ||
      from === to
    )
      return;
    move(from, to);
    setAnnouncement(
      "Activity moved from position " + (from + 1) + " to " + (to + 1) + ".",
    );
  }
  function dragEnd({ active, over }: DragEndEvent) {
    if (over)
      reorder(
        fields.findIndex((item) => item.editorKey === active.id),
        fields.findIndex((item) => item.editorKey === over.id),
      );
  }
  const typeOptions = new Map(
    (types.data || []).map((entry) => [entry.id, entry]),
  );
  if (createdType) typeOptions.set(createdType.id, createdType);
  if (typeId && !typeOptions.has(typeId))
    typeOptions.set(typeId, {
      id: typeId,
      name:
        initialType?.id === typeId
          ? initialType.name
          : "Current type #" + typeId,
    });
  const homecellOptions = new Map(
    (homecells.data || []).map((entry) => [entry.id, entry]),
  );
  if (copiedHomecell) homecellOptions.set(copiedHomecell.id, copiedHomecell);
  if (homecellId && !homecellOptions.has(homecellId))
    homecellOptions.set(homecellId, {
      id: homecellId,
      name:
        initialHomecell?.id === homecellId
          ? initialHomecell.name
          : "Current homecell #" + homecellId,
    });
  const people = new Map(
    [...initialPeople, ...copiedPeople].map((person) => [person.id, person]),
  );
  const entries = programFieldErrors(errors);
  const attributes = (
    field: "name" | "date" | "location" | "typeId" | "homecellId",
  ) => ({
    id: "program-" + field,
    className: "record-input",
    disabled,
    "aria-invalid": !!errors[field],
    "aria-describedby": errors[field]
      ? "program-" + field + "-error"
      : undefined,
  });
  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Program editor"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  return (
    <article
      className="record-page member-workspace"
      aria-labelledby="program-editor-title"
    >
      {!embedded && (
        <Link href={backHref} className="record-back">
          Back to {mode === "create" ? plural.replace("program-", "") : noun}
        </Link>
      )}
      <header className="record-header">
        <div>
          <p className="record-eyebrow">
            Worship and fellowship
            {initialData?.id ? " · #" + initialData.id : ""}
          </p>
          <Heading id="program-editor-title" className="record-title">
            {mode === "edit"
              ? "Edit " + noun
              : kind === "program"
                ? "Plan a program"
                : "Create a program template"}
          </Heading>
          <p className="record-description">
            {kind === "program"
              ? "Prepare a clear order of service so everyone knows what comes next."
              : "Build a reusable order of activities for future church gatherings."}
          </p>
        </div>
      </header>
      <form
        className="member-editor mt-6"
        aria-label={(mode === "edit" ? "Edit " : "Create ") + noun}
        aria-busy={busy}
        noValidate
        onSubmit={form.handleSubmit(save, () =>
          setAttempt((value) => value + 1),
        )}
      >
        <p className="member-form-help">
          Fields marked * are required. Times, descriptions and responsible
          people are optional.
          {mode === "edit" &&
            kind === "program" &&
            " Updating the date or location keeps the existing public web address."}
        </p>
        {(entries.length > 0 || saveError) && (
          <div
            className="member-form-summary"
            ref={summary}
            tabIndex={-1}
            role="alert"
          >
            <h2>
              {saveError
                ? "Save not confirmed"
                : "Check the highlighted fields"}
            </h2>
            {saveError && <p>{saveError}</p>}
            {entries.length > 0 && (
              <ul>
                {entries.map((entry) => (
                  <li key={entry.path}>
                    <a
                      href={"#program-" + entry.path.replaceAll(".", "-")}
                      onClick={(event) => {
                        event.preventDefault();
                        document
                          .getElementById(
                            "program-" + entry.path.replaceAll(".", "-"),
                          )
                          ?.focus();
                      }}
                    >
                      {entry.path.startsWith("items.")
                        ? "Activity " +
                          (Number(entry.path.split(".")[1]) + 1) +
                          ": "
                        : ""}
                      {entry.message}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {saveError && (
              <Link href={backHref} className="directory-text-link">
                Review saved{" "}
                {mode === "create" ? plural.replace("program-", "") : noun}
              </Link>
            )}
          </div>
        )}
        <RecordSection
          title={kind === "program" ? "Gathering details" : "Template details"}
          description={
            kind === "program"
              ? "Program dates and activity times use Malawi time (CAT, UTC+02:00)."
              : "Give this reusable structure a clear name. A template has no scheduled date."
          }
        >
          <div className="member-form-grid">
            <div className="member-form-field">
              <label
                htmlFor={kind === "program" ? "program-date" : "program-name"}
              >
                {kind === "program" ? "Program date *" : "Template name *"}
              </label>
              {kind === "program" ? (
                <input
                  {...form.register("date")}
                  {...attributes("date")}
                  type="date"
                  required
                />
              ) : (
                <input
                  {...form.register("name")}
                  {...attributes("name")}
                  maxLength={191}
                  required
                />
              )}
              {kind === "program" && errors.date ? (
                <p id="program-date-error" className="member-form-error">
                  {errors.date.message}
                </p>
              ) : (
                errors.name && (
                  <p id="program-name-error" className="member-form-error">
                    {errors.name.message}
                  </p>
                )
              )}
            </div>
            {kind === "program" && (
              <div className="member-form-field">
                <label htmlFor="program-location">Location</label>
                <input
                  {...form.register("location")}
                  {...attributes("location")}
                  maxLength={191}
                  placeholder="Venue or meeting location"
                />
                {errors.location && (
                  <p id="program-location-error" className="member-form-error">
                    {errors.location.message}
                  </p>
                )}
              </div>
            )}
            <div className="member-form-field">
              <label htmlFor="program-typeId">Program type *</label>
              <select
                {...form.register("typeId")}
                {...attributes("typeId")}
                disabled={disabled || types.isPending || types.isError}
                required
              >
                <option value="">Choose a program type</option>
                {[...typeOptions.values()].map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
              {errors.typeId && (
                <p id="program-typeId-error" className="member-form-error">
                  {errors.typeId.message}
                </p>
              )}
              {types.isPending ? (
                <p className="member-form-help" role="status">
                  Loading program types...
                </p>
              ) : types.isError ? (
                <p className="member-form-error" role="alert">
                  Program types could not be loaded. The current choice is kept.{" "}
                  <button
                    type="button"
                    className="directory-text-link"
                    disabled={busy}
                    onClick={() => {
                      void types.refetch();
                    }}
                  >
                    Reload types
                  </button>
                </p>
              ) : (
                !types.data?.length && (
                  <p className="member-form-help">
                    No program types are available. Add one to continue.
                  </p>
                )
              )}
              {!isView && (
                <button
                  type="button"
                  className="directory-text-link"
                  disabled={busy}
                  onClick={() => setAddingType(true)}
                >
                  Add program type
                </button>
              )}
            </div>
            <div className="member-form-field">
              <label htmlFor="program-homecellId">Homecell</label>
              <select
                {...form.register("homecellId")}
                {...attributes("homecellId")}
                disabled={disabled || homecells.isPending || homecells.isError}
              >
                <option value="">Church-wide / no homecell</option>
                {[...homecellOptions.values()].map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
              {errors.homecellId && (
                <p id="program-homecellId-error" className="member-form-error">
                  {errors.homecellId.message}
                </p>
              )}
              {homecells.isPending ? (
                <p className="member-form-help" role="status">
                  Loading homecells...
                </p>
              ) : (
                homecells.isError && (
                  <p className="member-form-error" role="alert">
                    Homecells could not be loaded. The current assignment is
                    kept.{" "}
                    <button
                      type="button"
                      className="directory-text-link"
                      disabled={busy}
                      onClick={() => {
                        void homecells.refetch();
                      }}
                    >
                      Reload homecells
                    </button>
                  </p>
                )
              )}
            </div>
          </div>
        </RecordSection>
        <RecordSection
          title="Order of activities"
          description="Add each part of the gathering in the order it will happen. You can leave times and responsibility unassigned until confirmed."
        >
          {kind === "program" && !isView && (
            <div className="member-form-actions mb-5">
              <button
                type="button"
                className="record-button record-button-secondary"
                disabled={busy}
                onClick={() => setSelectingTemplate(true)}
              >
                Start from a template
              </button>
              <Link
                href="/dashboard/program-templates"
                className="directory-text-link"
              >
                Browse templates
              </Link>
            </div>
          )}
          <div id="program-items" tabIndex={-1}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={dragEnd}
            >
              <SortableContext
                items={fields.map((item) => item.editorKey)}
                strategy={verticalListSortingStrategy}
              >
                <ol className="program-activity-list">
                  {fields.map((field, index) => {
                    const itemErrors = errors.items?.[index];
                    const itemId = "program-items-" + index + "-";
                    return (
                      <ActivityFrame
                        key={field.editorKey}
                        id={field.editorKey}
                        index={index}
                        disabled={disabled}
                      >
                        <div className="member-form-grid">
                          <div className="member-form-field">
                            <label htmlFor={itemId + "title"}>
                              Activity title *
                            </label>
                            <input
                              id={itemId + "title"}
                              className="record-input"
                              {...form.register(`items.${index}.title`)}
                              disabled={disabled}
                              maxLength={191}
                              required
                              aria-invalid={!!itemErrors?.title}
                              aria-describedby={
                                itemErrors?.title
                                  ? itemId + "title-error"
                                  : undefined
                              }
                            />
                            {itemErrors?.title && (
                              <p
                                id={itemId + "title-error"}
                                className="member-form-error"
                              >
                                {itemErrors.title.message}
                              </p>
                            )}
                          </div>
                          <div className="member-form-field">
                            <label htmlFor={itemId + "time"}>
                              Time or timing instruction
                            </label>
                            <input
                              id={itemId + "time"}
                              className="record-input"
                              {...form.register(`items.${index}.time`)}
                              disabled={disabled}
                              maxLength={191}
                              placeholder="09:30 or after the message"
                              aria-invalid={!!itemErrors?.time}
                              aria-describedby={
                                itemErrors?.time
                                  ? itemId + "time-error"
                                  : undefined
                              }
                            />
                            {itemErrors?.time && (
                              <p
                                id={itemId + "time-error"}
                                className="member-form-error"
                              >
                                {itemErrors.time.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="member-form-field mt-4">
                          <label htmlFor={itemId + "description"}>
                            Description or notes
                          </label>
                          <textarea
                            id={itemId + "description"}
                            className="record-input"
                            {...form.register(`items.${index}.description`)}
                            rows={3}
                            disabled={disabled}
                            aria-invalid={!!itemErrors?.description}
                            aria-describedby={
                              itemErrors?.description
                                ? itemId + "description-error"
                                : undefined
                            }
                          />
                          {itemErrors?.description && (
                            <p
                              id={itemId + "description-error"}
                              className="member-form-error"
                            >
                              {itemErrors.description.message}
                            </p>
                          )}
                        </div>
                        <div className="mt-4">
                          <GroupLeadershipPicker
                            id={itemId + "responsibleId"}
                            label={
                              "Responsible person for activity " + (index + 1)
                            }
                            value={items?.[index]?.responsibleId}
                            initialPerson={people.get(
                              items?.[index]?.responsibleId || "",
                            )}
                            actor={actor}
                            disabled={disabled}
                            error={itemErrors?.responsibleId?.message}
                            onChange={(value) =>
                              form.setValue(
                                `items.${index}.responsibleId`,
                                value,
                                { shouldDirty: true, shouldValidate: true },
                              )
                            }
                          />
                        </div>
                        {!isView && (
                          <div className="program-activity-actions">
                            <button
                              type="button"
                              className="record-button record-button-secondary"
                              disabled={busy || index === 0}
                              onClick={() => reorder(index, index - 1)}
                              aria-label={
                                "Move activity " + (index + 1) + " up"
                              }
                            >
                              Move up
                            </button>
                            <button
                              type="button"
                              className="record-button record-button-secondary"
                              disabled={busy || index === fields.length - 1}
                              onClick={() => reorder(index, index + 1)}
                              aria-label={
                                "Move activity " + (index + 1) + " down"
                              }
                            >
                              Move down
                            </button>
                            <button
                              type="button"
                              className="record-button record-button-secondary"
                              disabled={busy}
                              onClick={() => setRemoving(field.editorKey)}
                              aria-label={"Remove activity " + (index + 1)}
                            >
                              Remove activity
                            </button>
                          </div>
                        )}
                      </ActivityFrame>
                    );
                  })}
                </ol>
              </SortableContext>
            </DndContext>
            {!fields.length && (
              <p className="record-empty">
                No activities yet. Add the first activity, or save this outline
                and finish it later.
              </p>
            )}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>
          {!isView && (
            <button
              type="button"
              className="record-button record-button-secondary mt-5"
              disabled={busy}
              onClick={() =>
                append({
                  title: "",
                  description: "",
                  time: "",
                  responsibleId: "",
                })
              }
            >
              Add activity
            </button>
          )}
        </RecordSection>
        {kind === "program" && !isView && (
          <div className="program-template-preview">
            <p className="member-form-help">
              Reuse this order of activities for future gatherings. Saving a
              template copy keeps this program draft open.
            </p>
            <button
              type="button"
              className="directory-text-link"
              disabled={busy}
              onClick={() => {
                setCopyError("");
                setCopying(true);
              }}
            >
              Save a template copy
            </button>
            {savedCopy && (
              <p role="status" className="member-form-help">
                Template copy saved.{" "}
                <Link
                  href={
                    "/dashboard/program-templates/" +
                    encodeURIComponent(savedCopy)
                  }
                  className="directory-text-link"
                >
                  Open saved template
                </Link>
              </p>
            )}
          </div>
        )}
        <footer className="member-form-footer">
          <p className="member-form-help">
            {isDirty
              ? "You have unsaved changes."
              : "Review the details and activity order before saving."}
          </p>
          <div>
            <button
              type="button"
              className="record-button record-button-secondary"
              disabled={busy}
              onClick={() => {
                if (isDirty) setDiscarding(true);
                else router.push(backHref);
              }}
            >
              {isView ? "Back" : "Cancel"}
            </button>
            {!isView && (
              <button
                type="submit"
                className="record-button record-button-primary"
                disabled={busy}
              >
                {busy ? (
                  <InlineLoader
                    message={typeBusy ? "Creating type..." : "Saving..."}
                  />
                ) : mode === "edit" ? (
                  "Save changes"
                ) : (
                  "Create " + noun
                )}
              </button>
            )}
          </div>
        </footer>
        {mode === "edit" && onDelete && (
          <details className="record-more-actions">
            <summary className="directory-text-link">
              Other {noun} actions
            </summary>
            <RecordActionDialog
              secondary
              actionKey={kind + ":delete:" + initialData?.id}
              label={"Delete " + noun}
              title={"Delete " + noun + " #" + initialData?.id + "?"}
              description={
                kind === "template"
                  ? "Remove this template from the active list. Programs already created from it remain available. Unsaved edits will not be saved."
                  : "Remove this program from the active listing. Unsaved edits will not be saved."
              }
              pendingLabel="Deleting..."
              successMessage="Deletion confirmed."
              busy={busy}
              onConfirm={async () => {
                if (blocked())
                  throw new Error("Another action is in progress.");
                deleting.current = true;
                setDeleteBusy(true);
                try {
                  await onDelete();
                } finally {
                  deleting.current = false;
                  setDeleteBusy(false);
                }
              }}
            />
          </details>
        )}
      </form>
      {addingType && (
        <Dialog
          open
          onClose={() => {
            if (!typeBusy) setAddingType(false);
          }}
          closeDisabled={typeBusy}
          title="Add program type"
        >
          <ProgramTypeForm
            onPendingChange={setCategoryBusy}
            onCancel={() => {
              if (!typeBusy) setAddingType(false);
            }}
            onSuccess={(entry) => {
              setCreatedType(entry);
              form.setValue("typeId", entry.id, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setAddingType(false);
            }}
          />
        </Dialog>
      )}
      {selectingTemplate && (
        <ProgramTemplatePicker
          actor={actor}
          onClose={() => setSelectingTemplate(false)}
          onApply={(template) => {
            form.setValue("typeId", template.type.id, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setCreatedType(template.type);
            const homecell = template.homecellId || template.homecell?.id || "";
            form.setValue("homecellId", homecell, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setCopiedHomecell(template.homecell || null);
            replace(
              template.items.map((item) => ({
                title: item.title,
                description: item.description || "",
                time: item.time || "",
                responsibleId: item.responsibleId || item.responsible?.id || "",
              })),
            );
            setCopiedPeople(
              template.items.flatMap((item) =>
                item.responsible
                  ? [
                      {
                        id: item.responsible.id,
                        name: [
                          item.responsible.firstName,
                          item.responsible.lastName,
                        ]
                          .filter(Boolean)
                          .join(" "),
                      },
                    ]
                  : [],
              ),
            );
            setSelectingTemplate(false);
            setAnnouncement(
              "Template applied. Review the activities before saving.",
            );
          }}
        />
      )}
      {kind === "program" && !isView && (
        <Dialog
          open={copying}
          onClose={() => {
            if (!busy) setCopying(false);
          }}
          closeDisabled={busy}
          title="Save a template copy"
          description="Copy the type, homecell, activities, notes and responsibility assignments. The program date and location are not copied."
        >
          <div className="member-form-field">
            <label htmlFor="program-copy-name">Template name *</label>
            <input
              id="program-copy-name"
              className="record-input"
              value={copyName}
              maxLength={191}
              onChange={(event) => setCopyName(event.target.value)}
              disabled={busy}
              aria-invalid={!!copyError}
              aria-describedby={copyError ? "program-copy-error" : undefined}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void saveCopy();
                }
              }}
            />
            {copyError && (
              <p
                id="program-copy-error"
                role="alert"
                className="member-form-error"
              >
                {copyError}{" "}
                <Link
                  href="/dashboard/program-templates"
                  className="directory-text-link"
                >
                  Review saved templates
                </Link>
              </p>
            )}
          </div>
          <div className="member-form-actions mt-5">
            <button
              type="button"
              className="record-button record-button-primary"
              disabled={busy}
              onClick={() => {
                void saveCopy();
              }}
            >
              {busy ? (
                <InlineLoader message="Saving template..." />
              ) : (
                "Create template copy"
              )}
            </button>
            <button
              type="button"
              className="record-button record-button-secondary"
              disabled={busy}
              onClick={() => setCopying(false)}
            >
              Keep editing program
            </button>
          </div>
        </Dialog>
      )}
      <Dialog
        open={discarding}
        onClose={() => setDiscarding(false)}
        title="Leave unsaved changes?"
        description="Your entries have not been saved to this record."
      >
        <div className="member-form-actions">
          <button
            type="button"
            className="record-button record-button-primary"
            onClick={() => {
              form.reset();
              router.push(backHref);
            }}
          >
            Leave without saving
          </button>
          <button
            type="button"
            className="record-button record-button-secondary"
            onClick={() => setDiscarding(false)}
          >
            Keep editing
          </button>
        </div>
      </Dialog>
      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove this activity?"
        description="Its title, notes, time and responsibility will be removed from this draft. Save the program or template to keep the change."
      >
        <div className="member-form-actions">
          <button
            type="button"
            className="record-button record-button-primary"
            onClick={() => {
              const index = fields.findIndex(
                (item) => item.editorKey === removing,
              );
              if (index >= 0) remove(index);
              setRemoving(null);
            }}
          >
            Remove activity
          </button>
          <button
            type="button"
            className="record-button record-button-secondary"
            onClick={() => setRemoving(null)}
          >
            Keep activity
          </button>
        </div>
      </Dialog>
    </article>
  );
}
