"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import {
  useSaveStreamEditor,
  useStreamEditorPlatforms,
} from "@/lib/hooks/useStreamEditor";
import {
  streamEditorDefaults,
  streamEditorFailure,
  streamEditorPayload,
  streamEditorSchema,
  streamPlatformPage,
  streamPlatformUrl,
  type StreamEditorValues,
} from "@/lib/utils/stream-editor";
import { programFieldErrors } from "@/lib/utils/program-editor";
import type { Platform, Stream } from "../types/stream.types";
import {
  RecordFeedback,
  RecordSection,
  RecordStatus,
} from "@/components/records/RecordLayout";
import { StreamPreview } from "@/components/records/StreamPreview";
import { StreamPlatformEditor } from "@/components/records/StreamPlatformEditor";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function StreamForm({
  initialData,
  mode = "create",
  onDelete,
}: {
  initialData?: Partial<Stream>;
  mode?: "create" | "edit" | "view";
  onDelete?: () => Promise<unknown>;
}) {
  const actor = useAuthStore((state) => state.user),
    permitted = hasRequiredRole(actor?.roles ?? [], ["MEDIA"]);
  const router = useRouter(),
    mutation = useSaveStreamEditor(),
    query = useStreamEditorPlatforms(actor);
  const form = useForm<StreamEditorValues>({
    resolver: zodResolver(streamEditorSchema),
    defaultValues: streamEditorDefaults(initialData),
  });
  const [platformIds = [], isLive = false] = useWatch({
    control: form.control,
    name: ["platformIds", "isLive"],
  });
  const { errors, dirtyFields, isDirty, isSubmitting } = form.formState;
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [platformEditor, setPlatformEditor] = useState<Platform | "new" | null>(
      null,
    ),
    [savedPlatforms, setSavedPlatforms] = useState<Platform[]>([]);
  const [saveError, setSaveError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [discarding, setDiscarding] = useState(false),
    [platformBusy, setPlatformBusy] = useState(false),
    [deleteBusy, setDeleteBusy] = useState(false),
    [liveIntent, setLiveIntent] = useState<StreamEditorValues | null>(null);
  const submitting = useRef(false),
    changingPlatform = useRef(false),
    deleting = useRef(false),
    summary = useRef<HTMLDivElement>(null);
  const busy = mutation.isPending || isSubmitting || platformBusy || deleteBusy,
    isView = mode === "view",
    disabled = busy || isView;
  const backHref =
    "/dashboard/streams" +
    (mode !== "create" && initialData?.id
      ? "/" + encodeURIComponent(initialData.id)
      : "");
  const updatePlatformBusy = useCallback((value: boolean) => {
    changingPlatform.current = value;
    setPlatformBusy(value);
  }, []);
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
  const platformMap = new Map(
    (initialData?.platforms ?? []).map((platform) => [platform.id, platform]),
  );
  for (const platform of query.data ?? [])
    platformMap.set(platform.id, platform);
  for (const platform of savedPlatforms) platformMap.set(platform.id, platform);
  const available = new Map(
    (query.data ?? []).map((platform) => [platform.id, platform]),
  );
  for (const platform of savedPlatforms) available.set(platform.id, platform);
  const choices = streamPlatformPage(
    [...available.values()].sort((a, b) => a.name.localeCompare(b.name)),
    search,
    page,
  );
  const selected = platformIds.map(
    (id) =>
      platformMap.get(id) ?? { id, name: "Current platform #" + id, url: "" },
  );
  const blocked = () =>
    submitting.current ||
    changingPlatform.current ||
    deleting.current ||
    !permitted ||
    isView;
  function choose(ids: string[]) {
    form.setValue("platformIds", [...new Set(ids)], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }
  function cancel() {
    if (blocked() || busy) return;
    if (isDirty) setDiscarding(true);
    else router.push(backHref);
  }
  async function save(values: StreamEditorValues) {
    if (blocked()) return;
    if (mode === "edit" && !initialData?.id) {
      setLiveIntent(null);
      setSaveError(
        "This stream has no record ID. Reopen it from the streams list.",
      );
      setAttempt((value) => value + 1);
      return;
    }
    if (
      values.isLive &&
      !values.platformIds.some((id) =>
        streamPlatformUrl(platformMap.get(id)?.url ?? ""),
      )
    ) {
      form.setError("platformIds", {
        message:
          "Connect a platform with an available watch link before selecting the live broadcast.",
      });
      setLiveIntent(null);
      setAttempt((value) => value + 1);
      return;
    }
    submitting.current = true;
    setSaveError("");
    try {
      const response = await mutation.mutateAsync({
        id: mode === "edit" ? initialData?.id : undefined,
        data: streamEditorPayload(
          values,
          mode === "edit"
            ? {
                ...dirtyFields,
                platformIds: Array.isArray(dirtyFields.platformIds)
                  ? dirtyFields.platformIds.some(Boolean)
                  : !!dirtyFields.platformIds,
              }
            : undefined,
        ),
      });
      form.reset(values);
      setLiveIntent(null);
      router.push("/dashboard/streams/" + encodeURIComponent(response.data.id));
    } catch (error) {
      setSaveError(streamEditorFailure(error, mode === "create"));
      setLiveIntent(null);
      setAttempt((value) => value + 1);
    } finally {
      submitting.current = false;
    }
  }
  async function requestSave(values: StreamEditorValues) {
    if (blocked()) return;
    if (values.isLive && !initialData?.isLive) setLiveIntent(values);
    else await save(values);
  }
  const entries = programFieldErrors(errors);
  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Stream editor"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  return (
    <article
      className="record-page member-workspace"
      aria-labelledby="stream-editor-title"
    >
      <Link
        href={backHref}
        className="record-back"
        onClick={(event) => {
          if (busy || blocked() || isDirty) {
            event.preventDefault();
            cancel();
          }
        }}
      >
        Back to {mode === "create" ? "streams" : "stream"}
      </Link>
      <header className="record-header">
        <div className="min-w-0">
          <p className="record-eyebrow">
            Worship beyond the church building
            {initialData?.id ? " / #" + initialData.id : ""}
          </p>
          <h1 id="stream-editor-title" className="record-title">
            {mode === "create"
              ? "Prepare a broadcast"
              : isView
                ? initialData?.title
                : "Edit broadcast"}
          </h1>
          <p className="record-description">
            Help the congregation find the service and join from wherever they
            are.
          </p>
        </div>
        <RecordStatus tone={initialData?.isLive ? "positive" : "neutral"}>
          {initialData?.isLive ? "Selected live" : "Not selected live"}
        </RecordStatus>
      </header>
      <form
        className="member-editor mt-6"
        aria-label={mode === "edit" ? "Edit stream" : "Create stream"}
        aria-busy={busy}
        noValidate
        onSubmit={form.handleSubmit(requestSave, () =>
          setAttempt((value) => value + 1),
        )}
      >
        <div className="content-editor-notice">
          <p className="member-form-help">
            Stream pages are public once saved. A start time makes the stream
            eligible for the upcoming/active list. Not selecting it live does
            not hide its public page. Fields marked * are required.
            {mode === "edit" &&
              " Renaming keeps its existing public web address."}
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
                      href={"#stream-" + entry.path}
                      onClick={(event) => {
                        event.preventDefault();
                        document
                          .getElementById("stream-" + entry.path)
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
              <Link href={backHref}>
                Review the saved stream before retrying
              </Link>
            )}
          </div>
        )}
        <RecordSection
          title="Service and schedule"
          description="Use a title people will recognize and the church's local service times."
        >
          <div className="member-editor">
            <div className="member-form-field">
              <label htmlFor="stream-title">Stream title *</label>
              <input
                id="stream-title"
                className="record-input"
                maxLength={191}
                autoComplete="off"
                {...form.register("title")}
                disabled={disabled}
                aria-invalid={!!errors.title}
                aria-describedby={
                  errors.title ? "stream-title-error" : undefined
                }
              />
              {errors.title && (
                <p id="stream-title-error" className="member-form-error">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="member-form-grid">
              {(["startsAt", "endsAt"] as const).map((key) => (
                <div key={key} className="member-form-field">
                  <label htmlFor={"stream-" + key}>
                    {key === "startsAt" ? "Starts" : "Ends"} (optional)
                  </label>
                  <input
                    id={"stream-" + key}
                    className="record-input"
                    type="datetime-local"
                    step="any"
                    {...form.register(key)}
                    disabled={disabled}
                    aria-invalid={!!errors[key]}
                    aria-describedby={
                      "stream-" + key + "-help stream-" + key + "-error"
                    }
                  />
                  <p
                    id={"stream-" + key + "-help"}
                    className="member-form-help"
                  >
                    {key === "startsAt"
                      ? "Malawi time (CAT, UTC+2). Required for Watch online selection."
                      : "Malawi time. Leave blank when the end time is unknown. Clearing removes the saved end time."}
                  </p>
                  {errors[key] && (
                    <p
                      id={"stream-" + key + "-error"}
                      className="member-form-error"
                    >
                      {errors[key]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </RecordSection>
        <RecordSection
          title="Where to watch"
          description="Choose shared destinations and check the public watch links."
        >
          <div className="member-editor">
            <p className="member-form-help">
              Platform names and watch links are shared by all streams using
              them. Choose a separate platform record when this service needs a
              different link.
            </p>
            <fieldset
              id="stream-platformIds"
              tabIndex={-1}
              className="member-form-field"
              aria-describedby="stream-platform-help stream-platform-error"
            >
              <legend>Connected platforms</legend>
              <p id="stream-platform-help" className="member-form-help">
                {platformIds.length} selected. Selections stay in place when
                searching or changing pages.
              </p>
              {query.isPending && (
                <p role="status" className="record-empty my-3">
                  Loading platforms...
                </p>
              )}
              {query.isError && (
                <div className="content-editor-notice my-3">
                  <p role="alert" className="member-form-help">
                    Platforms could not be refreshed. Current selections are
                    kept; the server checks availability when saving.
                  </p>
                  <button
                    type="button"
                    className="record-button record-button-secondary mt-3"
                    disabled={disabled || query.isFetching}
                    onClick={() => {
                      void query.refetch();
                    }}
                  >
                    Retry platforms
                  </button>
                </div>
              )}
              <div className="member-form-field mt-4">
                <label htmlFor="stream-platform-search">Find a platform</label>
                <input
                  id="stream-platform-search"
                  className="record-input"
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  disabled={disabled}
                  placeholder="Search name or watch address"
                />
              </div>
              {choices.data.length ? (
                <ul className="member-ministry-choices">
                  {choices.data.map((platform) => (
                    <li key={platform.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={platformIds.includes(platform.id)}
                          disabled={disabled}
                          onChange={(event) =>
                            choose(
                              event.target.checked
                                ? [...platformIds, platform.id]
                                : platformIds.filter(
                                    (id) => id !== platform.id,
                                  ),
                            )
                          }
                        />
                        <span>
                          <span className="block font-semibold">
                            {platform.name}
                          </span>
                          <span className="member-form-help block wrap-anywhere">
                            {platform.url}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                !query.isPending && (
                  <p className="record-empty my-4">
                    {search
                      ? "No platforms match this search."
                      : query.isError
                        ? "Platform choices are unavailable. Retry the lookup to choose another destination."
                        : "No platforms have been added. Create a shared platform to connect a watch link."}
                  </p>
                )
              )}
              {choices.pages > 1 && (
                <div className="member-form-actions mt-4">
                  <button
                    type="button"
                    className="record-button record-button-secondary"
                    disabled={disabled || choices.page <= 1}
                    onClick={() => setPage(choices.page - 1)}
                  >
                    Previous platforms
                  </button>
                  <span className="member-form-help" aria-live="polite">
                    Page {choices.page} of {choices.pages} / {choices.total}{" "}
                    platforms
                  </span>
                  <button
                    type="button"
                    className="record-button record-button-secondary"
                    disabled={disabled || choices.page >= choices.pages}
                    onClick={() => setPage(choices.page + 1)}
                  >
                    Next platforms
                  </button>
                </div>
              )}
              {errors.platformIds && (
                <p id="stream-platform-error" className="member-form-error">
                  {errors.platformIds.message}
                </p>
              )}
            </fieldset>
            {!!selected.length && (
              <div className="record-stack">
                <h3 className="font-semibold">Selected destinations</h3>
                <StreamPreview
                  key={selected
                    .map((platform) => platform.id + platform.url)
                    .join("|")}
                  platforms={selected}
                  title={initialData?.title || "Stream"}
                />
                {!isView && (
                  <ul className="record-platforms">
                    {selected.map((platform) => (
                      <li key={platform.id}>
                        <p className="font-semibold wrap-anywhere">
                          {platform.name}
                        </p>
                        <div className="member-form-actions">
                          <button
                            type="button"
                            className="record-button record-button-secondary"
                            disabled={disabled || !platform.url}
                            onClick={() => setPlatformEditor(platform)}
                          >
                            Edit shared platform
                            <span className="sr-only"> {platform.name}</span>
                          </button>
                          <button
                            type="button"
                            className="record-button record-button-secondary"
                            disabled={disabled}
                            onClick={() =>
                              choose(
                                platformIds.filter((id) => id !== platform.id),
                              )
                            }
                          >
                            Disconnect
                            <span className="sr-only"> {platform.name}</span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {!isView && (
              <div className="member-form-actions">
                <button
                  type="button"
                  className="record-button record-button-secondary"
                  disabled={disabled}
                  onClick={() => setPlatformEditor("new")}
                >
                  Add a shared platform
                </button>
                {!!platformIds.length && (
                  <button
                    type="button"
                    className="record-button record-button-secondary"
                    disabled={disabled}
                    onClick={() => choose([])}
                  >
                    Clear platform selection
                  </button>
                )}
              </div>
            )}
          </div>
        </RecordSection>
        <RecordSection
          title="Watch online selection"
          description="Select the church's featured live broadcast deliberately."
        >
          <div className="member-form-choices">
            <label htmlFor="stream-isLive">
              <input
                id="stream-isLive"
                type="checkbox"
                {...form.register("isLive")}
                disabled={disabled}
                aria-describedby="stream-live-help"
              />
              Select this stream as the live broadcast
            </label>
          </div>
          <p id="stream-live-help" className="member-form-help mt-3">
            {isLive
              ? "Saving this selection switches off any other selected live stream immediately. Watch online uses the start/end window, so a future start is not shown there yet. An end time that has passed cannot be selected live."
              : "This stream stays available at its public address, without replacing the selected live broadcast."}{" "}
            This setting does not start or stop a broadcast on YouTube or
            another service.
          </p>
        </RecordSection>
        {!isView && (
          <footer className="member-form-footer">
            <p className="member-form-help">
              Review the watch links and Malawi service times before saving.
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
                  <InlineLoader message="Saving stream..." />
                ) : mode === "create" ? (
                  "Create stream"
                ) : (
                  "Save stream changes"
                )}
              </button>
            </div>
          </footer>
        )}
      </form>
      {platformEditor && (
        <StreamPlatformEditor
          key={platformEditor === "new" ? "new" : platformEditor.id}
          platform={platformEditor === "new" ? undefined : platformEditor}
          onBusyChange={updatePlatformBusy}
          onClose={() => setPlatformEditor(null)}
          onSaved={(platform) => {
            setSavedPlatforms((previous) => [
              ...previous.filter((item) => item.id !== platform.id),
              platform,
            ]);
            if (platformEditor === "new")
              choose([...form.getValues("platformIds"), platform.id]);
            setPlatformEditor(null);
          }}
        />
      )}
      <Dialog
        open={!!liveIntent}
        closeDisabled={busy}
        onClose={() => {
          if (!submitting.current) setLiveIntent(null);
        }}
        title="Save this as the live selection?"
        description="Any other selected live stream will be switched off when you save. A future start time delays its appearance on Watch online. This does not start a broadcast on an external service."
      >
        <div className="member-form-actions">
          <button
            type="button"
            className="record-button record-button-secondary"
            disabled={busy}
            onClick={() => setLiveIntent(null)}
          >
            Keep editing
          </button>
          <button
            type="button"
            className="record-button record-button-primary"
            disabled={busy}
            onClick={() => {
              if (liveIntent) void save(liveIntent);
            }}
          >
            {busy ? (
              <InlineLoader message="Saving live selection..." />
            ) : (
              "Save and select live"
            )}
          </button>
        </div>
      </Dialog>
      {onDelete && !isView && (
        <details className="record-section mt-6">
          <summary className="cursor-pointer font-semibold">
            More actions
          </summary>
          <p className="record-empty my-4">
            Deleting removes this stream and its public page. Shared platform
            records are kept.
          </p>
          <RecordActionDialog
            actionKey={"delete-stream-" + initialData?.id}
            label="Delete stream"
            title="Delete this stream?"
            description="Unsaved stream changes will be discarded. Shared platform records will remain available."
            pendingLabel="Deleting..."
            successMessage="Stream deleted."
            busy={busy}
            secondary
            onConfirm={async () => {
              if (blocked()) throw new Error("Wait for the current change.");
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
        title="Discard unsaved stream changes?"
        description="Shared platform changes already saved will remain. Unsaved stream details and connections will be discarded."
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
            Discard stream changes
          </button>
        </div>
      </Dialog>
    </article>
  );
}
