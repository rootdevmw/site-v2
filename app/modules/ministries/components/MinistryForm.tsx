"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ministrySchema, MinistryFormValues } from "../types/ministry.schema";

import { useCreateMinistry } from "../hooks/useCreateMinistry";
import { useUpdateMinistry } from "../hooks/useUpdateMinistry";
import { useMembers } from "../../members/hooks/useMembers";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { BaseForm } from "@/components/ui/BaseForm";
import { MinistryMember } from "../types/ministry.types";

import { useRouter } from "next/navigation";
import { showLoading, dismissToast, showError } from "@/lib/toast";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

export function MinistryForm({
  mode = "create",
  initialData,
  onDelete,
}: {
  mode?: "create" | "edit" | "view";
  initialData?: Partial<MinistryFormValues> & { id?: string };
  onDelete?: () => void;
}) {
  const router = useRouter();

  const createMutation = useCreateMinistry();
  const updateMutation = useUpdateMinistry();

  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: membersData } = useMembers({
    page: 1,
    limit: 100,
  });

  const members = (membersData?.data || []) as MinistryMember[];

  const form = useForm<MinistryFormValues>({
    resolver: zodResolver(ministrySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      leaderId: initialData?.leaderId ?? "",
      overseerId: initialData?.overseerId ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const onSubmit = (data: MinistryFormValues) => {
    const toastId = showLoading(
      isEdit ? "Updating ministry..." : "Creating ministry...",
    );

    if (isEdit && initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            dismissToast(toastId);
            router.push("/dashboard/ministries");
          },
          onError: () => {
            dismissToast(toastId);
            showError("Something went wrong");
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          dismissToast(toastId);
          router.push("/dashboard/ministries");
        },
        onError: () => {
          dismissToast(toastId);
          showError("Something went wrong");
        },
      });
    }
  };

  return (
    <BaseForm
      mode={mode}
      isLoading={isPending}
      onSubmit={handleSubmit(onSubmit)}
      onDelete={onDelete}
      title={
        isEdit ? "Edit Ministry" : isView ? "View Ministry" : "Create Ministry"
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <Input
          label="Ministry Name"
          {...register("name")}
          error={errors.name?.message}
          disabled={isView}
        />

        {/* Leader */}
        <Select
          label="Leader"
          {...register("leaderId")}
          error={errors.leaderId?.message}
          disabled={isView}
        >
          <option value="">Select leader</option>
          {members.map((m, index) => (
            <option key={m.id ?? index} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </Select>

        {/* Overseer */}
        <Select
          label="Overseer (Optional)"
          {...register("overseerId")}
          disabled={isView}
        >
          <option value="">Select overseer</option>
          {members.map((m, index) => (
            <option key={m.id ?? index} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </Select>
      </div>

      {/*  Rich Text Description */}
      <div className="space-y-2 mt-4">
        <label className="text-sm font-medium text-[var(--text-primary)]">
          Description
        </label>

        {isView ? (
          <div className="min-h-[200px] p-4 border border-[var(--border-soft)] rounded-lg bg-[var(--card-elevated)]">
            <div
              dangerouslySetInnerHTML={{
                __html: watch("description") || "",
              }}
            />
          </div>
        ) : (
          <RichTextEditor
            value={watch("description")}
            onChange={(value) => setValue("description", value)}
            error={errors.description?.message}
          />
        )}
      </div>
    </BaseForm>
  );
}
