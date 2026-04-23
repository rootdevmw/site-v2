"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { homecellSchema } from "../types/homecell.schema";
import { HomecellFormValues } from "../types/homecell.types";

import { useCreateHomecell } from "../hooks/useCreateHomecell";
import { useUpdateHomecell } from "../hooks/useUpdateHomecell";

import { useMembers } from "@/app/modules/members/hooks/useMembers";

import { Input } from "@/components/ui/Input";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { BaseForm } from "@/components/ui/BaseForm";

import { useRouter } from "next/navigation";
import { dismissToast, showLoading } from "@/lib/toast";

export function HomecellForm({
  mode = "create",
  initialData,
  onDelete,
}: {
  mode?: "create" | "edit" | "view";
  initialData?: Partial<HomecellFormValues> & { id?: string };
  onDelete?: () => void;
}) {
  const router = useRouter();

  const createMutation = useCreateHomecell();
  const updateMutation = useUpdateHomecell();

  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data } = useMembers({ page: 1, limit: 100 });

  const members = data?.data || [];
  const memberOptions = members.map((m: any) => ({
    label: `${m.firstName} ${m.lastName}`,
    value: m.id,
  }));

  const form = useForm<HomecellFormValues>({
    resolver: zodResolver(homecellSchema),
    defaultValues: initialData || {},
  });

  const onSubmit = (values: HomecellFormValues) => {
    const toastId = showLoading(
      isEdit ? "Updating homecell..." : "Creating homecell...",
    );

    if (isEdit && initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data: values },
        {
          onSuccess: () => {
            dismissToast(toastId);
            router.push("/dashboard/homecells");
          },
          onError: () => dismissToast(toastId),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          dismissToast(toastId);
          router.push("/dashboard/homecells");
        },
        onError: () => dismissToast(toastId),
      });
    }
  };

  return (
    <BaseForm
      mode={mode}
      isLoading={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      onDelete={onDelete}
      title={
        isEdit ? "Edit Homecell" : isView ? "View Homecell" : "Create Homecell"
      }
    >
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Homecell Name"
          {...form.register("name")}
          error={form.formState.errors.name?.message}
          disabled={isView}
        />

        <Input
          label="Location"
          {...form.register("location")}
          error={form.formState.errors.location?.message}
          disabled={isView}
        />

        {/* Leader */}
        <SearchableSelect
          label="Leader (Deacon)"
          options={memberOptions}
          value={form.watch("leaderId")}
          onChange={(val) => form.setValue("leaderId", val)}
          error={form.formState.errors.leaderId?.message}
          disabled={isView}
        />

        {/* Overseer */}
        <SearchableSelect
          label="Overseer (Pastor)"
          options={memberOptions}
          value={form.watch("overseerId")}
          onChange={(val) => form.setValue("overseerId", val)}
          error={form.formState.errors.overseerId?.message}
          disabled={isView}
        />
      </div>
    </BaseForm>
  );
}
