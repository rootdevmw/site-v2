"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Platform } from "@/app/modules/streams/types/stream.types";
import { useSaveStreamPlatform } from "@/lib/hooks/useStreamEditor";
import {
  streamEditorFailure,
  streamPlatformSchema,
  type StreamPlatformValues,
} from "@/lib/utils/stream-editor";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function StreamPlatformEditor({
  platform,
  onSaved,
  onClose,
  onBusyChange,
}: {
  platform?: Platform;
  onSaved: (platform: Platform) => void;
  onClose: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const mutation = useSaveStreamPlatform(),
    submitting = useRef(false);
  const form = useForm<StreamPlatformValues>({
    resolver: zodResolver(streamPlatformSchema),
    defaultValues: { name: platform?.name ?? "", url: platform?.url ?? "" },
  });
  const [failure, setFailure] = useState("");
  const { errors, isSubmitting, isDirty } = form.formState;
  const busy = mutation.isPending || isSubmitting;
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);
  async function save(values: StreamPlatformValues) {
    if (submitting.current) return;
    submitting.current = true;
    onBusyChange(true);
    setFailure("");
    try {
      const response = await mutation.mutateAsync({
        id: platform?.id,
        data: values,
      });
      form.reset(values);
      onSaved(response.data);
    } catch (error) {
      setFailure(streamEditorFailure(error, !platform, true));
    } finally {
      submitting.current = false;
      onBusyChange(false);
    }
  }
  return (
    <Dialog
      open
      title={platform ? "Edit shared platform" : "Add a shared platform"}
      description={
        platform
          ? "Saving changes updates this platform on every stream that uses it, including public pages."
          : "Creating a platform saves a shared record immediately. It will be selected in your stream; save the stream to connect it."
      }
      closeDisabled={busy}
      onClose={() => {
        if (!submitting.current) onClose();
      }}
    >
      <form
        className="member-editor"
        aria-label={
          platform ? "Edit shared platform" : "Create shared platform"
        }
        aria-busy={busy}
        noValidate
        onSubmit={form.handleSubmit(save)}
      >
        {failure && (
          <p role="alert" className="member-form-summary">
            {failure}
          </p>
        )}
        <div className="member-form-field">
          <label htmlFor="stream-platform-name">Platform name *</label>
          <input
            id="stream-platform-name"
            className="record-input"
            maxLength={191}
            {...form.register("name")}
            disabled={busy}
            aria-invalid={!!errors.name}
            aria-describedby={
              errors.name ? "stream-platform-name-error" : undefined
            }
          />
          {errors.name && (
            <p id="stream-platform-name-error" className="member-form-error">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="member-form-field">
          <label htmlFor="stream-platform-url">Full watch address *</label>
          <input
            id="stream-platform-url"
            className="record-input"
            type="url"
            autoComplete="off"
            placeholder="https://www.youtube.com/watch?v=..."
            {...form.register("url")}
            disabled={busy}
            aria-invalid={!!errors.url}
            aria-describedby="stream-platform-url-help stream-platform-url-error"
          />
          <p id="stream-platform-url-help" className="member-form-help">
            Use the public watch link. Web addresses must fit the 191-character
            storage limit. Stream keys and private credentials do not belong
            here.
          </p>
          {errors.url && (
            <p id="stream-platform-url-error" className="member-form-error">
              {errors.url.message}
            </p>
          )}
        </div>
        <div className="member-form-actions">
          <button
            type="button"
            className="record-button record-button-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="record-button record-button-primary"
            disabled={busy}
          >
            {busy ? (
              <InlineLoader message="Saving platform..." />
            ) : platform ? (
              "Save shared changes"
            ) : (
              "Create and select platform"
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
