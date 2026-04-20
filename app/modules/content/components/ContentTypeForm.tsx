"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateContentType } from "../hooks/useCreateContentType";
import { Input } from "@/components/ui/Input";
import { showSuccess, showError } from "@/lib/toast";

const contentTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type ContentTypeFormValues = z.infer<typeof contentTypeSchema>;

export function ContentTypeForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: (type: any) => void;
  onCancel?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentTypeFormValues>({
    resolver: zodResolver(contentTypeSchema),
    defaultValues: { name: "" },
  });

  const { mutateAsync, isPending } = useCreateContentType();

  const onSubmit = async (values: ContentTypeFormValues) => {
    try {
      const res = await mutateAsync(values);
      showSuccess("Content type created successfully");
      onSuccess?.(res.data);
    } catch {
      showError("Failed to create content type");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <Input label="Name" {...register("name")} error={errors.name?.message} />

      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-soft)]">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm bg-[var(--card-elevated)] text-[var(--text-primary)] hover:bg-[var(--hover-soft)]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
