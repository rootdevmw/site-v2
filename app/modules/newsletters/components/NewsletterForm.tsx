"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateNewsletter } from "../hooks/useCreateNewsletter";
import { useUpdateNewsletter } from "../hooks/useUpdateNewsletter";
import {
  newsletterSchema,
  NewsletterFormValues,
} from "../validation/newsletter.schema";
import type { Newsletter } from "../types/newsletter.types";

import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { DateInput } from "@/components/ui/DateInput";
import { showSuccess, showError } from "@/lib/toast";

type NewsletterFormInitialData = Partial<
  Omit<NewsletterFormValues, "description" | "publishedAt">
> & {
  id?: string;
  fileUrl?: string;
  description?: string | null;
  publishedAt?: Date | string | null;
};

function parsePublishedAt(value: NewsletterFormInitialData["publishedAt"]) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

export function NewsletterForm({
  initialData,
  onSuccess,
  mode = "create",
  onDelete,
}: {
  initialData?: NewsletterFormInitialData;
  onSuccess?: (newsletter: Newsletter) => void;
  mode?: "create" | "edit" | "view";
  onDelete?: () => void;
}) {
  const isView = mode === "view";

  const { mutateAsync: createNewsletter, isPending } = useCreateNewsletter();
  const { mutateAsync: updateNewsletter } = useUpdateNewsletter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema) as Resolver<NewsletterFormValues>,
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      publishedAt: parsePublishedAt(initialData?.publishedAt),
      file: undefined,
    },
  });

  const onSubmit = async (values: NewsletterFormValues) => {
    try {
      const res =
        mode === "edit" && initialData?.id
          ? await updateNewsletter({ id: initialData.id, data: values })
          : await createNewsletter(values);

      showSuccess(
        mode === "edit"
          ? "Newsletter updated successfully"
          : "Newsletter created successfully",
      );
      onSuccess?.(res.data);
    } catch {
      showError("Failed to save newsletter");
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
          ? "Edit Newsletter"
          : mode === "view"
            ? "View Newsletter"
            : "Create Newsletter"
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
            Download newsletter file
          </a>
        </div>
      )}
    </BaseForm>
  );
}
