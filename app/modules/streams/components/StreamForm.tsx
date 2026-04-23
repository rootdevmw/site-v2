"use client";

import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateStream } from "../hooks/useCreateStream";
import { useUpdateStream } from "../hooks/useUpdateStream";
import { usePlatforms } from "../hooks/usePlatforms";
import { useCreatePlatform } from "../hooks/useCreatePlatform";
import { useUpdatePlatform } from "../hooks/useUpdatePlatform";
import { streamSchema, StreamFormValues } from "../validation/stream.schema";
import type { Platform, Stream } from "../types/stream.types";

import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { DateInput } from "@/components/ui/DateInput";
import { showSuccess, showError } from "@/lib/toast";

type StreamFormInitialData = Partial<Omit<StreamFormValues, "startsAt">> & {
  id?: string;
  startsAt?: Date | string | null;
  platforms?: Platform[];
};

function parseStartsAt(value: StreamFormInitialData["startsAt"]) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

export function StreamForm({
  initialData,
  onSuccess,
  mode = "create",
  onDelete,
}: {
  initialData?: StreamFormInitialData;
  onSuccess?: (stream: Stream) => void;
  mode?: "create" | "edit" | "view";
  onDelete?: () => void;
}) {
  const isView = mode === "view";

  const { mutateAsync: createStream, isPending } = useCreateStream();
  const { mutateAsync: updateStream } = useUpdateStream();
  const { mutateAsync: createPlatform, isPending: creatingPlatform } =
    useCreatePlatform();
  const { mutateAsync: updatePlatform } = useUpdatePlatform();

  const { data: platformsData, isLoading: platformsLoading } = usePlatforms();
  const platforms = platformsData?.data || [];

  const [showCreatePlatform, setShowCreatePlatform] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformUrl, setNewPlatformUrl] = useState("");

  // Track per-platform URL edits: { [platformId]: url }
  const [platformUrlEdits, setPlatformUrlEdits] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      (initialData?.platforms ?? []).map((p) => [p.id, p.url]),
    ),
  );
  const [savingPlatformId, setSavingPlatformId] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StreamFormValues>({
    resolver: zodResolver(streamSchema) as Resolver<StreamFormValues>,
    defaultValues: {
      title: initialData?.title ?? "",
      isLive: initialData?.isLive ?? false,
      startsAt: parseStartsAt(initialData?.startsAt),
      platformIds: initialData?.platformIds ?? [],
    },
  });

  const platformIds = useWatch({ control, name: "platformIds" }) || [];

  const platformOptions = platforms.map((p: Platform) => ({
    label: p.name,
    value: p.id,
  }));

  // Platforms that are currently selected and have a known record
  const selectedPlatforms = platforms.filter((p: Platform) =>
    platformIds.includes(p.id),
  );

  const handlePlatformUrlChange = (id: string, url: string) => {
    setPlatformUrlEdits((prev) => ({ ...prev, [id]: url }));
  };

  const handleSavePlatformUrl = async (platform: Platform) => {
    const url = platformUrlEdits[platform.id]?.trim();
    if (!url || url === platform.url) return;

    setSavingPlatformId(platform.id);
    try {
      await updatePlatform({
        id: platform.id,
        data: { name: platform.name, url },
      });
      showSuccess(`${platform.name} URL updated`);
    } catch {
      showError(`Failed to update ${platform.name} URL`);
    } finally {
      setSavingPlatformId(null);
    }
  };

  const handleCreatePlatform = async () => {
    const name = newPlatformName.trim();
    const url = newPlatformUrl.trim();
    if (!name || !url) return;

    try {
      const res = await createPlatform({ name, url });
      setValue("platformIds", [...platformIds, res.data.id]);
      setPlatformUrlEdits((prev) => ({ ...prev, [res.data.id]: url }));
      setNewPlatformName("");
      setNewPlatformUrl("");
      setShowCreatePlatform(false);
    } catch {
      showError("Failed to create platform");
    }
  };

  const onSubmit = async (values: StreamFormValues) => {
    try {
      const res =
        mode === "edit" && initialData?.id
          ? await updateStream({ id: initialData.id, data: values })
          : await createStream(values);

      showSuccess(
        mode === "edit"
          ? "Stream updated successfully"
          : "Stream created successfully",
      );
      onSuccess?.(res.data);
    } catch {
      showError("Failed to save stream");
    }
  };

  return (
    <BaseForm
      mode={mode}
      isLoading={isPending}
      onSubmit={handleSubmit(onSubmit)}
      onDelete={onDelete}
      title={
        mode === "edit"
          ? "Edit Stream"
          : mode === "view"
            ? "View Stream"
            : "Create Stream"
      }
    >
      <Input
        label="Title"
        {...register("title")}
        error={errors.title?.message}
        disabled={isView}
      />

      <Select
        label="Status"
        {...register("isLive")}
        error={errors.isLive?.message}
        disabled={isView}
      >
        <option value="false">Scheduled</option>
        <option value="true">Live</option>
      </Select>

      <DateInput
        label="Start Date & Time"
        type="datetime-local"
        {...register("startsAt")}
        error={errors.startsAt?.message}
        disabled={isView}
      />

      <MultiSelect
        label="Platforms"
        options={platformOptions}
        value={platformIds}
        onChange={(vals) => setValue("platformIds", vals)}
        error={errors.platformIds?.message}
        disabled={isView || platformsLoading}
      />

      {/* Per-platform URL editors */}
      {selectedPlatforms.length > 0 && (
        <div className="space-y-2">
          {selectedPlatforms.map((platform: Platform) => {
            const currentUrl = platformUrlEdits[platform.id] ?? platform.url;
            const isDirty = currentUrl !== platform.url;
            const isSaving = savingPlatformId === platform.id;

            return (
              <div
                key={platform.id}
                className="flex items-center gap-2 p-3 rounded-lg border border-[var(--border-soft)] bg-[var(--card-elevated)]"
              >
                <span className="text-xs font-medium text-[var(--text-secondary)] w-20 shrink-0 truncate">
                  {platform.name}
                </span>
                <input
                  value={currentUrl}
                  onChange={(e) =>
                    handlePlatformUrlChange(platform.id, e.target.value)
                  }
                  placeholder="Platform URL"
                  disabled={isView || isSaving}
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-soft)] text-sm disabled:opacity-60"
                />
                {!isView && (
                  <button
                    type="button"
                    onClick={() => handleSavePlatformUrl(platform)}
                    disabled={!isDirty || isSaving}
                    className="shrink-0 px-3 py-1.5 rounded-md bg-[var(--main-gold)] text-black text-xs font-medium disabled:opacity-40 transition-opacity"
                  >
                    {isSaving ? "Saving…" : "Save"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isView &&
        (!showCreatePlatform ? (
          <button
            type="button"
            onClick={() => setShowCreatePlatform(true)}
            className="text-xs text-[var(--main-gold)] hover:underline"
          >
            + Add new platform
          </button>
        ) : (
          <div className="p-3 rounded-lg border border-[var(--border-soft)] bg-[var(--card-elevated)] space-y-2">
            <input
              value={newPlatformName}
              onChange={(e) => setNewPlatformName(e.target.value)}
              placeholder="Platform name"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-soft)]"
            />
            <input
              value={newPlatformUrl}
              onChange={(e) => setNewPlatformUrl(e.target.value)}
              placeholder="Platform URL"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-soft)]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreatePlatform(false)}
                className="text-sm text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePlatform}
                disabled={
                  creatingPlatform ||
                  !newPlatformName.trim() ||
                  !newPlatformUrl.trim()
                }
                className="px-3 py-1 rounded-md bg-[var(--main-gold)] text-black text-sm disabled:opacity-50"
              >
                {creatingPlatform ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        ))}
    </BaseForm>
  );
}
