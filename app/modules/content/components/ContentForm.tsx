"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import {
  useContentEditorTypes,
  useSaveContentEditor,
} from "@/lib/hooks/useContentEditor";
import {
  addContentTag,
  contentEditorDefaults,
  contentEditorFailure,
  contentEditorPayload,
  contentEditorSchema,
  type ContentEditorValues,
} from "@/lib/utils/content-editor";
import { programFieldErrors as fieldErrors } from "@/lib/utils/program-editor";
import type { RelatedRecord } from "@/lib/utils/record-details";
import {
  RecordFeedback,
  RecordSection,
  RecordStatus,
} from "@/components/records/RecordLayout";
import { RecordRichText } from "@/components/records/RecordRichText";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { ContentAuthorPicker } from "@/components/records/ContentAuthorPicker";
import { ContentTypeForm } from "./ContentTypeForm";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function ContentForm({
  mode = "create",
  initialData,
  initialType,
  initialAuthor,
  status = "Draft",
  onDelete,
}: {
  mode?: "create" | "edit" | "view";
  initialData?: Partial<ContentEditorValues> & { id?: string };
  initialType?: RelatedRecord | null;
  initialAuthor?: RelatedRecord | null;
  status?: string;
  onDelete?: () => Promise<unknown>;
}) {
  const actor = useAuthStore((state) => state.user),
    permitted = hasRequiredRole(actor?.roles ?? [], ["MEDIA"]);
  const router = useRouter(),
    mutation = useSaveContentEditor(),
    types = useContentEditorTypes(actor);
  const form = useForm<ContentEditorValues>({
    resolver: zodResolver(contentEditorSchema),
    defaultValues: contentEditorDefaults(initialData),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "scriptures",
    keyName: "editorKey",
  });
  const [body, authorId, typeId, tags, title] = useWatch({
    control: form.control,
    name: ["body", "authorId", "typeId", "tags", "title"],
  });
  const { errors, dirtyFields, isDirty, isSubmitting } = form.formState;
  const [preview, setPreview] = useState(false),
    [uploadBusy, setUploadBusy] = useState(false),
    [typeBusy, setTypeBusy] = useState(false),
    [deleteBusy, setDeleteBusy] = useState(false),
    [addingType, setAddingType] = useState(false),
    [discarding, setDiscarding] = useState(false);
  const [createdType, setCreatedType] = useState<RelatedRecord | null>(null),
    [saveError, setSaveError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [tagInput, setTagInput] = useState(""),
    [tagError, setTagError] = useState("");
  const submitting = useRef(false),
    uploading = useRef(false),
    creatingType = useRef(false),
    deleting = useRef(false),
    summary = useRef<HTMLDivElement>(null);
  const busy =
      mutation.isPending ||
      isSubmitting ||
      uploadBusy ||
      typeBusy ||
      deleteBusy,
    isView = mode === "view",
    disabled = busy || isView,
    published = status === "Published";
  const backHref =
    "/dashboard/content" +
    (mode !== "create" && initialData?.id
      ? "/" + encodeURIComponent(initialData.id)
      : "");
  const setMediaBusy = useCallback((value: boolean) => {
    uploading.current = value;
    setUploadBusy(value);
  }, []);
  const setCategoryBusy = useCallback((value: boolean) => {
    creatingType.current = value;
    setTypeBusy(value);
  }, []);
  useEffect(() => {
    if (!isDirty && !tagInput.trim()) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, tagInput]);
  useEffect(() => {
    if (attempt) summary.current?.focus();
  }, [attempt]);
  const blocked = () =>
    submitting.current ||
    uploading.current ||
    creatingType.current ||
    deleting.current ||
    !permitted ||
    isView;
  function addTag() {
    if (disabled) return;
    const result = addContentTag(form.getValues("tags"), tagInput);
    setTagError(result.error);
    if (!result.error) {
      form.setValue("tags", result.tags, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setTagInput("");
    }
  }
  async function save(values: ContentEditorValues) {
    if (blocked()) return;
    if (mode === "edit" && !initialData?.id) {
      setSaveError(
        "This message has no record ID. Reopen it from the content list.",
      );
      setAttempt((value) => value + 1);
      return;
    }
    let pendingTag = false;
    if (tagInput.trim()) {
      const result = addContentTag(values.tags, tagInput);
      if (result.error) {
        setTagError(result.error);
        setSaveError(
          "Review the unfinished tag before saving. Add it or clear the tag field.",
        );
        setAttempt((value) => value + 1);
        return;
      }
      values = { ...values, tags: result.tags };
      pendingTag = true;
      form.setValue("tags", result.tags, { shouldDirty: true });
      setTagInput("");
    }
    submitting.current = true;
    setSaveError("");
    try {
      const changed =
        mode === "edit"
          ? {
              body: !!dirtyFields.body,
              type: !!dirtyFields.typeId,
              author: !!dirtyFields.authorId,
              tags: pendingTag || !!dirtyFields.tags,
              scriptures: !!dirtyFields.scriptures,
            }
          : undefined;
      const response = await mutation.mutateAsync({
        id: mode === "edit" ? initialData?.id : undefined,
        data: contentEditorPayload(values, changed),
      });
      form.reset(values);
      router.push("/dashboard/content/" + encodeURIComponent(response.data.id));
    } catch (error) {
      setSaveError(contentEditorFailure(error, mode === "create"));
      setAttempt((value) => value + 1);
    } finally {
      submitting.current = false;
    }
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
  const entries = fieldErrors(errors);
  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Content editor"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  return (
    <article
      className="record-page member-workspace"
      aria-labelledby="content-editor-title"
    >
      <Link href={backHref} className="record-back">
        Back to {mode === "create" ? "content" : "message"}
      </Link>
      <header className="record-header">
        <div>
          <p className="record-eyebrow">
            Messages for the church
            {initialData?.id ? " · #" + initialData.id : ""}
          </p>
          <h1 id="content-editor-title" className="record-title">
            {mode === "create"
              ? "Share a message"
              : isView
                ? initialData?.title
                : "Edit message"}
          </h1>
          <p className="record-description">
            Prepare teaching, encouragement and church stories that invite
            people to grow in faith.
          </p>
        </div>
        <RecordStatus tone={published ? "positive" : "neutral"}>
          {published
            ? "Published"
            : status === "Draft"
              ? "Draft"
              : "Status to review"}
        </RecordStatus>
      </header>
      <form
        className="member-editor mt-6"
        aria-label={mode === "edit" ? "Edit content" : "Create content"}
        aria-busy={busy}
        noValidate
        onSubmit={form.handleSubmit(save, () =>
          setAttempt((value) => value + 1),
        )}
      >
        <div className="content-editor-notice">
          <p className="member-form-help">
            {published
              ? "This message is public. Saved edits update the published message immediately."
              : status === "Draft" || mode === "create"
                ? "New messages are saved as drafts. Review the saved message before publishing from its detail page."
                : "Review this message's publishing status on its detail page. Saving edits does not change its status."}
            {mode === "edit" &&
              " Renaming keeps the existing public web address."}
          </p>
          <p className="member-form-help mt-2">
            Fields marked * are required. Author, tags and scripture index
            references are optional.
          </p>
        </div>
        {(entries.length > 0 || saveError) && (
          <div
            className="member-form-summary"
            role="alert"
            tabIndex={-1}
            ref={summary}
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
                      href={"#content-" + entry.path.replaceAll(".", "-")}
                      onClick={(event) => {
                        event.preventDefault();
                        if (entry.path === "body") setPreview(false);
                        requestAnimationFrame(() =>
                          document
                            .getElementById(
                              "content-" + entry.path.replaceAll(".", "-"),
                            )
                            ?.focus(),
                        );
                      }}
                    >
                      {entry.path.startsWith("scriptures.")
                        ? "Reference " +
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
                Review saved {mode === "create" ? "content" : "message"}
              </Link>
            )}
          </div>
        )}
        <RecordSection
          title="Message details"
          description="Give readers a clear title and choose where this message belongs."
        >
          <div className="member-form-grid">
            <div className="member-form-field">
              <label htmlFor="content-title">Title *</label>
              <input
                id="content-title"
                className="record-input"
                {...form.register("title")}
                disabled={disabled}
                required
                maxLength={191}
                aria-invalid={!!errors.title}
                aria-describedby={
                  errors.title ? "content-title-error" : undefined
                }
              />
              {errors.title && (
                <p id="content-title-error" className="member-form-error">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="member-form-field">
              <label htmlFor="content-typeId">Content type *</label>
              <select
                id="content-typeId"
                className="record-input"
                {...form.register("typeId")}
                disabled={disabled || types.isPending || types.isError}
                required
                aria-invalid={!!errors.typeId}
                aria-describedby={
                  errors.typeId ? "content-typeId-error" : undefined
                }
              >
                <option value="">Choose a content type</option>
                {[...typeOptions.values()].map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
              {errors.typeId && (
                <p id="content-typeId-error" className="member-form-error">
                  {errors.typeId.message}
                </p>
              )}
              {types.isPending ? (
                <p role="status" className="member-form-help">
                  Loading content types...
                </p>
              ) : types.isError ? (
                <p role="alert" className="member-form-error">
                  Content types could not be loaded. The current choice is kept.{" "}
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
                    No types are available. Add one to continue.
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
                  Add content type
                </button>
              )}
            </div>
            <ContentAuthorPicker
              actor={actor}
              value={authorId}
              initialAuthor={initialAuthor}
              disabled={disabled}
              error={errors.authorId?.message}
              onChange={(value) =>
                form.setValue("authorId", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>
        </RecordSection>
        <RecordSection
          title="Write your message"
          description="Keep the message welcoming, readable and grounded in the teaching you want to share."
        >
          {!isView && (
            <div className="member-form-actions mb-4">
              <button
                type="button"
                className="record-button record-button-secondary"
                aria-pressed={!preview}
                disabled={busy}
                onClick={() => setPreview(false)}
              >
                Write
              </button>
              <button
                type="button"
                className="record-button record-button-secondary"
                aria-pressed={preview}
                disabled={busy}
                onClick={() => setPreview(true)}
              >
                Preview
              </button>
            </div>
          )}
          {!isView && (
            <div hidden={preview}>
              <RichTextEditor
                id="content-body"
                label="Message body *"
                value={body}
                onChange={(value) =>
                  form.setValue("body", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={disabled}
                error={errors.body?.message}
                onBusyChange={setMediaBusy}
                editorHeightClassName="h-[clamp(18rem,55dvh,38rem)]"
              />
            </div>
          )}
          {(preview || isView) && (
            <div
              className="content-writing-preview record-reader"
              aria-label="Message preview"
            >
              <h2 className="content-preview-title">
                {title || "Untitled message"}
              </h2>
              <RecordRichText
                content={body}
                emptyMessage="Start writing to preview your message."
              />
            </div>
          )}
          <p className="member-form-help mt-4">
            Media uploads must finish before saving. Uploading a file does not
            save the message. Use the scripture toolbar button for inline
            references; add index references below for message discovery.
          </p>
        </RecordSection>
        <RecordSection
          title="Tags"
          description="Use short topic names to help readers find related messages."
        >
          <div id="content-tags" tabIndex={-1} className="member-form-field">
            <label htmlFor="content-tag-input">Add a topic tag</label>
            <div className="content-tag-entry">
              <input
                id="content-tag-input"
                className="record-input"
                value={tagInput}
                onChange={(event) => {
                  setTagInput(event.target.value);
                  setTagError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                disabled={disabled}
                maxLength={191}
                placeholder="For example: Prayer"
                aria-invalid={!!tagError}
                aria-describedby="content-tag-help"
              />
              <button
                type="button"
                className="record-button record-button-secondary"
                disabled={disabled}
                onClick={addTag}
              >
                Add tag
              </button>
            </div>
            <p
              id="content-tag-help"
              className={tagError ? "member-form-error" : "member-form-help"}
              role={tagError ? "alert" : undefined}
            >
              {tagError ||
                "Press Enter or Add tag. An unfinished valid tag is included when you save."}
            </p>
            <ul className="content-tag-list">
              {(tags || []).map((tag, index) => (
                <li key={tag} className="record-tag">
                  <span>{tag}</span>
                  {!isView && (
                    <button
                      type="button"
                      className="content-tag-remove"
                      disabled={busy}
                      onClick={() =>
                        form.setValue(
                          "tags",
                          (form.getValues("tags") || []).filter(
                            (_, current) => current !== index,
                          ),
                          { shouldDirty: true, shouldValidate: true },
                        )
                      }
                      aria-label={"Remove tag " + tag}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {!tags?.length && (
              <p className="member-form-help mt-3">No topic tags added.</p>
            )}
            {errors.tags && (
              <p className="member-form-error">
                {errors.tags.message || "Review the topic tags."}
              </p>
            )}
          </div>
        </RecordSection>
        <RecordSection
          title="Scripture index"
          description="These references appear alongside the message. Adding or removing an index reference does not rewrite inline scripture in the message body."
        >
          <div
            id="content-scriptures"
            tabIndex={-1}
            className="program-activity-list"
          >
            {fields.map((field, index) => {
              const entryErrors = errors.scriptures?.[index];
              return (
                <div key={field.editorKey} className="program-activity">
                  <div className="program-activity-heading">
                    <h3>Reference {index + 1}</h3>
                    {!isView && (
                      <button
                        type="button"
                        className="record-button record-button-secondary"
                        disabled={busy}
                        onClick={() => remove(index)}
                        aria-label={"Remove scripture reference " + (index + 1)}
                      >
                        Remove reference
                      </button>
                    )}
                  </div>
                  <div className="member-form-grid">
                    {(
                      [
                        "book",
                        "chapter",
                        "verseFrom",
                        "verseTo",
                        "version",
                      ] as const
                    ).map((name) => {
                      const numeric = [
                          "chapter",
                          "verseFrom",
                          "verseTo",
                        ].includes(name),
                        fieldId = "content-scriptures-" + index + "-" + name,
                        error = entryErrors?.[name];
                      return (
                        <div key={name} className="member-form-field">
                          <label htmlFor={fieldId}>
                            {name === "book"
                              ? "Book *"
                              : name === "chapter"
                                ? "Chapter *"
                                : name === "verseFrom"
                                  ? "First verse *"
                                  : name === "verseTo"
                                    ? "Last verse (optional)"
                                    : "Version (optional)"}
                          </label>
                          <input
                            id={fieldId}
                            className="record-input"
                            {...form.register(
                              `scriptures.${index}.${name}`,
                              numeric
                                ? {
                                    setValueAs: (value) =>
                                      value === "" ||
                                      value === null ||
                                      value === undefined
                                        ? undefined
                                        : Number(value),
                                  }
                                : {},
                            )}
                            type={numeric ? "number" : "text"}
                            min={numeric ? 1 : undefined}
                            max={numeric ? 2147483647 : undefined}
                            step={numeric ? 1 : undefined}
                            maxLength={numeric ? undefined : 191}
                            required={!["verseTo", "version"].includes(name)}
                            disabled={disabled}
                            aria-invalid={!!error}
                            aria-describedby={
                              error ? fieldId + "-error" : undefined
                            }
                          />
                          {error && (
                            <p
                              id={fieldId + "-error"}
                              className="member-form-error"
                            >
                              {error.message}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {!fields.length && (
            <p className="record-empty">
              No scripture index references added yet.
            </p>
          )}
          {!isView && (
            <button
              type="button"
              className="record-button record-button-secondary mt-4"
              disabled={busy}
              onClick={() =>
                append({ book: "", chapter: 1, verseFrom: 1, version: "" })
              }
            >
              Add scripture reference
            </button>
          )}
        </RecordSection>
        <footer className="member-form-footer">
          <p className="member-form-help">
            {isDirty || tagInput.trim()
              ? "You have unsaved changes."
              : published
                ? "Saved edits update the public message."
                : "Save a draft, then review and publish it from the detail page."}
          </p>
          <div>
            <button
              type="button"
              className="record-button record-button-secondary"
              disabled={busy}
              onClick={() => {
                if (isDirty || tagInput.trim()) setDiscarding(true);
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
                    message={
                      uploadBusy
                        ? "Waiting for media upload..."
                        : typeBusy
                          ? "Creating type..."
                          : "Saving..."
                    }
                  />
                ) : published ? (
                  "Save published changes"
                ) : status !== "Draft" && mode === "edit" ? (
                  "Save changes"
                ) : mode === "edit" ? (
                  "Save draft changes"
                ) : (
                  "Save draft"
                )}
              </button>
            )}
          </div>
        </footer>
        {mode === "edit" && onDelete && (
          <details className="record-more-actions">
            <summary className="directory-text-link">
              Other message actions
            </summary>
            <RecordActionDialog
              secondary
              actionKey={"content:delete:" + initialData?.id}
              label="Delete content"
              title={"Delete message #" + initialData?.id + "?"}
              description="Remove this message from the active content list and public listing. Unsaved edits will not be saved."
              pendingLabel="Deleting..."
              successMessage="Deletion confirmed."
              busy={busy}
              onConfirm={async () => {
                if (blocked())
                  throw new Error("Another message action is in progress.");
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
          title="Add content type"
        >
          <ContentTypeForm
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
      <Dialog
        open={discarding}
        onClose={() => setDiscarding(false)}
        title="Leave unsaved changes?"
        description="Your entries have not been saved to this message."
      >
        <div className="member-form-actions">
          <button
            type="button"
            className="record-button record-button-primary"
            onClick={() => {
              form.reset();
              setTagInput("");
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
    </article>
  );
}
