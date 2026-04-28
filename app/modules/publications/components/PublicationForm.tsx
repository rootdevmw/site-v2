"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreatePublication } from "../hooks/useCreatePublication";
import { useUpdatePublication } from "../hooks/useUpdatePublication";
import {
  publicationSchema,
  PublicationFormValues,
} from "../validation/publication.schema";
import type { Publication } from "../types/publication.types";

import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { showSuccess, showError } from "@/lib/toast";

type PublicationFormInitialData = Partial<
  Omit<PublicationFormValues, "description" | "publishedAt">
> & {
  id?: string;
  fileUrl?: string;
  description?: string | null;
  publishedAt?: Date | string | null;
};

function parsePublishedAt(value: PublicationFormInitialData["publishedAt"]) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

export function PublicationForm({
  initialData,
  onSuccess,
  mode = "create",
  onDelete,
}: {
  initialData?: PublicationFormInitialData;
  onSuccess?: (publication: Publication) => void;
  mode?: "create" | "edit" | "view";
  onDelete?: () => void;
}) {
  const isView = mode === "view";

  const { mutateAsync: createPublication, isPending } = useCreatePublication();
  const { mutateAsync: updatePublication } = useUpdatePublication();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema) as Resolver<PublicationFormValues>,
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      publishedAt: parsePublishedAt(initialData?.publishedAt),
      file: undefined,
    },
  });

  const onSubmit = async (values: PublicationFormValues) => {
    try {
      const res =
        mode === "edit" && initialData?.id
          ? await updatePublication({ id: initialData.id, data: values })
          : await createPublication(values);

      showSuccess(
        mode === "edit"
          ? "Publication updated successfully"
          : "Publication created successfully",
      );
      onSuccess?.(res.data);
    } catch {
      showError("Failed to save publication");
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
          ? "Edit Publication"
          : mode === "view"
            ? "View Publication"
            : "Create Publication"
      }
    >
      <Input
        label="Title"
        {...register("title")}
        error={errors.title?.message}
        disabled={isView}
      />

      <Input
        label="Description"
        {...register("description")}
        error={errors.description?.message}
        disabled={isView}
      />

      <DateInput
        label="Published Date"
        type="datetime-local"
        {...register("publishedAt")}
        error={errors.publishedAt?.message}
        disabled={isView}
      />

      {!isView && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-primary)]">
            File
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setValue("file", file);
            }}
            className="w-full text-sm text-[var(--text-secondary)]"
          />
          {errors.file && (
            <p className="text-xs text-red-500">{errors.file.message}</p>
          )}
        </div>
      )}

      {isView && initialData?.fileUrl && (
        <div className="mt-4">
          <a
            href={initialData.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--main-gold)] underline"
          >
            Download Publication file
          </a>
        </div>
      )}
    </BaseForm>
  );
}
