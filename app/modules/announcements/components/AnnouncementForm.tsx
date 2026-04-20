"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateAnnouncement } from "../hooks/useCreateAnnouncement";
import { useUpdateAnnouncement } from "../hooks/useUpdateAnnouncement";
import {
  announcementSchema,
  AnnouncementFormValues,
} from "../validation/announcement.schema";

import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { DateInput } from "@/components/ui/DateInput";
import { showSuccess, showError } from "@/lib/toast";

export function AnnouncementForm({
  initialData,
  onSuccess,
  mode = "create",
  onDelete,
}: {
  initialData?: Partial<AnnouncementFormValues> & { id?: string };
  onSuccess?: (announcement: any) => void;
  mode?: "create" | "edit" | "view";
  onDelete?: () => void;
}) {
  const isView = mode === "view";

  const { mutateAsync: createAnnouncement, isPending } =
    useCreateAnnouncement();
  const { mutateAsync: updateAnnouncement } = useUpdateAnnouncement();

  // Preprocess initialData to ensure expiryDate is string or null
  const processedInitialData = {
    ...initialData,
    expiryDate:
      typeof initialData?.expiryDate === "string"
        ? initialData.expiryDate
        : null,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(
      announcementSchema,
    ) as Resolver<AnnouncementFormValues>,
    defaultValues: {
      title: processedInitialData?.title ?? "",
      body: processedInitialData?.body ?? "",
      priority: processedInitialData?.priority ?? 5,
      expiryDate: processedInitialData?.expiryDate ?? null,
      targets: processedInitialData?.targets ?? [],
    },
  });

  const onSubmit = async (values: AnnouncementFormValues) => {
    try {
      const res =
        mode === "edit" && initialData?.id
          ? await updateAnnouncement({ id: initialData.id, data: values })
          : await createAnnouncement(values);

      showSuccess(
        mode === "edit"
          ? "Announcement updated successfully"
          : "Announcement created successfully",
      );
      onSuccess?.(res.data);
    } catch {
      showError("Failed to save announcement");
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
          ? "Edit Announcement"
          : mode === "view"
            ? "View Announcement"
            : "Create Announcement"
      }
    >
      <Input
        label="Title"
        {...register("title")}
        error={errors.title?.message}
        disabled={isView}
      />

      <Input
        label="Priority (1-10)"
        type="number"
        min={1}
        max={10}
        {...register("priority", { valueAsNumber: true })}
        error={errors.priority?.message}
        disabled={isView}
      />

      <DateInput
        label="Expiry Date (optional)"
        type="datetime-local"
        {...register("expiryDate")}
        error={errors.expiryDate?.message}
        disabled={isView}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Body
        </label>
        {isView ? (
          <div className="min-h-[200px] p-4 border border-[var(--border-soft)] rounded-lg bg-[var(--card-elevated)]">
            <div dangerouslySetInnerHTML={{ __html: watch("body") || "" }} />
          </div>
        ) : (
          <RichTextEditor
            value={watch("body")}
            onChange={(value) => setValue("body", value)}
            error={errors.body?.message}
          />
        )}
      </div>
    </BaseForm>
  );
}
