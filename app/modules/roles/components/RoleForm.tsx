"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema, RoleFormValues } from "../types/role.types";
import { useCreateRole } from "../hooks/useRoleActions";
import { useUpdateRole } from "../hooks/useRoleActions";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { BaseForm } from "@/components/ui/BaseForm";
import { dismissToast, showLoading } from "@/lib/toast";

export function RoleForm({
  mode = "create",
  initialData,
  onDelete,
}: {
  mode?: "create" | "edit" | "view";
  initialData?: Partial<RoleFormValues> & { id?: string };
  onDelete?: () => void;
}) {
  const router = useRouter();

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialData || {},
  });

  const onSubmit = (data: RoleFormValues) => {
    const toastId = showLoading(
      isEdit ? "Updating role..." : "Creating role...",
    );

    if (isEdit && initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            dismissToast(toastId);
            router.push("/dashboard/roles");
          },
          onError: () => {
            dismissToast(toastId);
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          dismissToast(toastId);
          router.push("/dashboard/roles");
        },
        onError: () => {
          dismissToast(toastId);
        },
      });
    }
  };

  return (
    <BaseForm
      mode={mode}
      isLoading={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      onDelete={onDelete}
      title={isEdit ? "Edit Role" : isView ? "View Role" : "Create Role"}
    >
      <Input
        label="Role Name"
        {...form.register("name")}
        error={form.formState.errors.name?.message}
        disabled={isView}
        placeholder="Enter role name"
      />
    </BaseForm>
  );
}
