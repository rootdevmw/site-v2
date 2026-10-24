"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useSavePublicationEditor } from "@/lib/hooks/usePublicationEditor";
import {
  publicationEditorDefaults,
  publicationEditorFailure,
  publicationEditorPayload,
  publicationEditorSchema,
  validatePublicationFile,
  type PublicationEditorValues,
} from "@/lib/utils/publication-editor";
import { eventTimeInput } from "@/lib/utils/event-editor";
import { getPublicationFile } from "@/lib/utils/editorial-records";
import { programFieldErrors } from "@/lib/utils/program-editor";
import type { Publication } from "../types/publication.types";
import {
  RecordFeedback,
  RecordSection,
  RecordStatus,
} from "@/components/records/RecordLayout";
import { PublicationPreview } from "@/components/records/PublicationPreview";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function PublicationForm({
  initialData,
  mode = "create",
  onDelete,
}: {
  initialData?: Partial<Publication>;
  mode?: "create" | "edit" | "view";
  onDelete?: () => Promise<unknown>;
}) {
  const actor = useAuthStore((state) => state.user),
    permitted = hasRequiredRole(actor?.roles ?? [], ["MEDIA"]);
  const router = useRouter(),
    mutation = useSavePublicationEditor();
  const form = useForm<PublicationEditorValues>({
    resolver: zodResolver(publicationEditorSchema),
    defaultValues: publicationEditorDefaults(initialData),
  });
  const [file, visibility, publishedAt] = useWatch({
    control: form.control,
    name: ["file", "visibility", "publishedAt"],
  });
  const { errors, dirtyFields, isDirty, isSubmitting } = form.formState;
  const [saveError, setSaveError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [checking, setChecking] = useState(false),
    [discarding, setDiscarding] = useState(false),
    [deleteBusy, setDeleteBusy] = useState(false);
  const submitting = useRef(false),
    deleting = useRef(false),
    summary = useRef<HTMLDivElement>(null),
    fileInput = useRef<HTMLInputElement>(null);
  const isView = mode === "view",
    busy = mutation.isPending || isSubmitting || checking || deleteBusy,
    disabled = busy || isView;
  const currentFile = getPublicationFile(initialData?.fileUrl),
    wasPublished = !!initialData?.publishedAt;
  const backHref =
    "/dashboard/publications" +
    (mode !== "create" && initialData?.id
      ? "/" + encodeURIComponent(initialData.id)
      : "");
  useEffect(() => {
    if (!isDirty && !file) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, file]);
  useEffect(() => {
    if (attempt) summary.current?.focus();
  }, [attempt]);
  function cancel() {
    if (busy || submitting.current || deleting.current) return;
    if (isDirty || file) setDiscarding(true);
    else router.push(backHref);
  }
  async function save(values: PublicationEditorValues) {
    if (submitting.current || deleting.current || !permitted || isView) return;
    if (mode === "edit" && !initialData?.id) {
      setSaveError(
        "This publication has no record ID. Reopen it from the publications list.",
      );
      setAttempt((value) => value + 1);
      return;
    }
    if (
      values.visibility === "Published" &&
      !values.file &&
      !currentFile.href
    ) {
      form.setError("file", {
        message:
          "Attach a PDF before publishing, or save this publication as a draft.",
      });
      setAttempt((value) => value + 1);
      return;
    }
    submitting.current = true;
    setChecking(true);
    setSaveError("");
    try {
      if (values.file) {
        const issue = await validatePublicationFile(values.file);
        if (issue) {
          form.setError("file", { message: issue });
          setAttempt((value) => value + 1);
          return;
        }
      }
      const response = await mutation.mutateAsync({
        id: mode === "edit" ? initialData?.id : undefined,
        data: publicationEditorPayload(
          values,
          mode === "edit" ? dirtyFields : undefined,
        ),
      });
      form.reset({ ...values, file: undefined });
      if (fileInput.current) fileInput.current.value = "";
      router.push(
        "/dashboard/publications/" + encodeURIComponent(response.data.id),
      );
    } catch (error) {
      setSaveError(publicationEditorFailure(error, mode === "create"));
      setAttempt((value) => value + 1);
    } finally {
      submitting.current = false;
      setChecking(false);
    }
  }
  const entries = programFieldErrors(errors);
  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Publication editor"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  return (
    <article
      className="record-page member-workspace"
      aria-labelledby="publication-editor-title"
    >
      <Link
        href={backHref}
        className="record-back"
        onClick={(event) => {
          if (
            busy ||
            submitting.current ||
            deleting.current ||
            isDirty ||
            file
          ) {
            event.preventDefault();
            cancel();
          }
        }}
      >
        Back to {mode === "create" ? "publications" : "publication"}
      </Link>
      <header className="record-header">
        <div>
          <p className="record-eyebrow">
            Resources for the congregation
            {initialData?.id ? " / #" + initialData.id : ""}
          </p>
          <h1 id="publication-editor-title" className="record-title">
            {mode === "create"
              ? "Prepare a publication"
              : isView
                ? initialData?.title
                : "Edit publication"}
          </h1>
          <p className="record-description">
            Give people a clear introduction to the documents that support
            church life.
          </p>
        </div>
        <RecordStatus tone={wasPublished ? "positive" : "neutral"}>
          {wasPublished ? "Published" : "Draft"}
        </RecordStatus>
      </header>
      <form
        className="member-editor mt-6"
        aria-label={mode === "edit" ? "Edit publication" : "Create publication"}
        aria-busy={busy}
        noValidate
        onSubmit={form.handleSubmit(save, () =>
          setAttempt((value) => value + 1),
        )}
      >
        <div className="content-editor-notice">
          <p className="member-form-help">
            {wasPublished
              ? "This publication is public. Saving published changes updates its details and document immediately."
              : "Start with a draft, then review its details and document before sharing it publicly."}{" "}
            Fields marked * are required.
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
                      href={"#publication-" + entry.path}
                      onClick={(event) => {
                        event.preventDefault();
                        document
                          .getElementById("publication-" + entry.path)
                          ?.focus();
                      }}
                    >
                      {entry.message}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {saveError && (
              <Link
                href={mode === "create" ? "/dashboard/publications" : backHref}
              >
                Review saved publications before retrying
              </Link>
            )}
          </div>
        )}
        <RecordSection
          title="Introduce the resource"
          description="Use a specific title and explain who the document is for."
        >
          <div className="member-editor">
            <div className="member-form-field">
              <label htmlFor="publication-title">Title *</label>
              <input
                id="publication-title"
                className="record-input"
                maxLength={191}
                autoComplete="off"
                {...form.register("title")}
                disabled={disabled}
                aria-invalid={!!errors.title}
                aria-describedby={
                  errors.title ? "publication-title-error" : undefined
                }
              />
              {errors.title && (
                <p id="publication-title-error" className="member-form-error">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="member-form-field">
              <label htmlFor="publication-description">Description</label>
              <textarea
                id="publication-description"
                className="record-input"
                rows={5}
                {...form.register("description")}
                disabled={disabled}
                aria-invalid={!!errors.description}
                aria-describedby="publication-description-help publication-description-error"
              />
              <p id="publication-description-help" className="member-form-help">
                A short introduction helps readers choose the right resource.
                Optional.
              </p>
              {errors.description && (
                <p
                  id="publication-description-error"
                  className="member-form-error"
                >
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </RecordSection>
        <RecordSection
          title="Document"
          description="Attach a readable PDF with selectable text where possible."
        >
          <div className="member-editor">
            {currentFile.href ? (
              <div>
                <p className="record-eyebrow mb-3">Currently saved document</p>
                <PublicationPreview
                  key={initialData?.fileUrl}
                  fileUrl={initialData?.fileUrl ?? ""}
                  title={initialData?.title || "Publication document"}
                />
              </div>
            ) : (
              <p className="record-empty">
                No usable document is attached. You can save the introduction as
                a draft and add the PDF later.
              </p>
            )}
            {!isView && (
              <div className="member-form-field">
                <label htmlFor="publication-file">
                  {currentFile.href
                    ? "Choose a replacement PDF"
                    : "Choose a PDF"}
                </label>
                <input
                  id="publication-file"
                  ref={fileInput}
                  className="record-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={disabled}
                  aria-invalid={!!errors.file}
                  aria-describedby="publication-file-help publication-file-error"
                  onChange={(event) => {
                    const selected = event.target.files?.[0];
                    if (selected)
                      form.setValue("file", selected, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                  }}
                />
                <p id="publication-file-help" className="member-form-help">
                  PDF only, up to 50 MB. The selected document uploads when you
                  save. Existing attachments stay in place until a replacement
                  is saved.
                </p>
                {file && (
                  <div className="content-editor-notice">
                    <p className="wrap-anywhere font-semibold">
                      Selected: {file.name}
                    </p>
                    <p className="member-form-help">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB. Review the
                      saved document after uploading.
                    </p>
                    <button
                      type="button"
                      className="record-button record-button-secondary mt-3"
                      disabled={disabled}
                      onClick={() => {
                        form.setValue("file", undefined, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        form.clearErrors("file");
                        if (fileInput.current) fileInput.current.value = "";
                      }}
                    >
                      {currentFile.href
                        ? "Keep current document"
                        : "Clear selected document"}
                    </button>
                  </div>
                )}
                {errors.file && (
                  <p id="publication-file-error" className="member-form-error">
                    {errors.file.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </RecordSection>
        <RecordSection
          title="Sharing and publication date"
          description="Choose whether this resource appears on the website."
        >
          <div className="member-form-grid">
            <div className="member-form-field">
              <label htmlFor="publication-visibility">Visibility *</label>
              <select
                id="publication-visibility"
                className="record-input"
                {...form.register("visibility", {
                  onChange: (event) => {
                    if (
                      event.target.value === "Published" &&
                      !form.getValues("publishedAt")
                    )
                      form.setValue(
                        "publishedAt",
                        eventTimeInput(new Date().toISOString()),
                        { shouldDirty: true, shouldValidate: true },
                      );
                  },
                })}
                disabled={disabled}
                aria-describedby="publication-visibility-help"
              >
                <option value="Draft">Draft - private</option>
                <option value="Published">Published - public</option>
              </select>
              <p id="publication-visibility-help" className="member-form-help">
                {visibility === "Published"
                  ? "Saving makes this resource public immediately. A document is required."
                  : "Drafts stay off the public publications list. A document is optional."}
              </p>
            </div>
            {visibility === "Published" && (
              <div className="member-form-field">
                <label htmlFor="publication-publishedAt">
                  Publication date and time *
                </label>
                <input
                  id="publication-publishedAt"
                  className="record-input"
                  type="datetime-local"
                  step="any"
                  {...form.register("publishedAt")}
                  disabled={disabled}
                  aria-invalid={!!errors.publishedAt}
                  aria-describedby="publication-date-help publication-date-error"
                />
                <p id="publication-date-help" className="member-form-help">
                  Malawi time (CAT, UTC+2). This date labels and orders the
                  publication; a future date does not schedule its release.
                </p>
                {errors.publishedAt && (
                  <p id="publication-date-error" className="member-form-error">
                    {errors.publishedAt.message}
                  </p>
                )}
              </div>
            )}
          </div>
          {visibility === "Published" && publishedAt && (
            <p className="member-form-help mt-4">
              Check the saved document and date after publishing.
            </p>
          )}
        </RecordSection>
        {!isView && (
          <footer className="member-form-footer">
            <p className="member-form-help">
              {file
                ? "Your selected PDF will upload with this save."
                : currentFile.href
                  ? "The currently saved document will be kept."
                  : "You can save a draft without a document."}
            </p>
            <div className="member-form-actions">
              <button
                type="button"
                className="record-button record-button-secondary"
                disabled={busy}
                onClick={cancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="record-button record-button-primary"
                disabled={busy}
              >
                {busy ? (
                  <InlineLoader message="Saving publication..." />
                ) : visibility === "Published" ? (
                  wasPublished ? (
                    "Save published changes"
                  ) : (
                    "Save and publish"
                  )
                ) : wasPublished ? (
                  "Save as draft"
                ) : (
                  "Save draft"
                )}
              </button>
            </div>
          </footer>
        )}
      </form>
      {onDelete && !isView && (
        <details className="record-section mt-6">
          <summary className="cursor-pointer font-semibold">
            More actions
          </summary>
          <p className="record-empty my-4">
            Deleting removes this publication from management and public
            listings. Stored documents are retained.
          </p>
          <RecordActionDialog
            actionKey={"delete-publication-" + initialData?.id}
            label="Delete publication"
            title="Delete this publication?"
            description="Unsaved changes will be discarded and this publication will leave the listings."
            pendingLabel="Deleting..."
            successMessage="Publication deleted."
            busy={busy}
            secondary
            onConfirm={async () => {
              if (submitting.current || deleting.current)
                throw new Error("Wait for the current change.");
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
      <Dialog
        open={discarding}
        onClose={() => setDiscarding(false)}
        title="Discard unsaved changes?"
        description="Your edits and selected document have not been saved."
      >
        <div className="member-form-actions">
          <button
            type="button"
            className="record-button record-button-secondary"
            onClick={() => setDiscarding(false)}
          >
            Keep editing
          </button>
          <button
            type="button"
            className="record-button record-button-primary"
            onClick={() => {
              form.reset();
              setDiscarding(false);
              router.push(backHref);
            }}
          >
            Discard changes
          </button>
        </div>
      </Dialog>
    </article>
  );
}
