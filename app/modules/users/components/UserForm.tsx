"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  userSchema,
  createUserSchema,
  UserFormValues,
  CreateUserFormValues,
} from "../types/user.types";
import { useCreateUser } from "../hooks/useUserActions";
import { useUpdateUser } from "../hooks/useUserActions";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { BaseForm } from "@/components/ui/BaseForm";
import { dismissToast, showLoading } from "@/lib/toast";

type UserFormInternalValues = {
  email: string;
  password?: string;
};

export function UserForm({
  mode = "create",
  initialData,
  onDelete,
}: {
  mode?: "create" | "edit" | "view";
  initialData?: Partial<UserFormInternalValues> & { id?: string };
  onDelete?: () => void;
}) {
  const router = useRouter();

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const formSchema = isEdit ? userSchema : createUserSchema;
  const form = useForm<UserFormInternalValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  const onSubmit = (data: UserFormInternalValues) => {
    const toastId = showLoading(
      isEdit ? "Updating user..." : "Creating user...",
    );

    if (isEdit && initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data: { email: data.email } },
        {
          onSuccess: () => {
            dismissToast(toastId);
            router.push("/users");
          },
          onError: () => {
            dismissToast(toastId);
          },
        },
      );
    } else {
      createMutation.mutate(
        { email: data.email, password: data.password ?? "" },
        {
          onSuccess: () => {
            dismissToast(toastId);
            router.push("/users");
          },
          onError: () => {
            dismissToast(toastId);
          },
        },
      );
    }
  };

  return (
    <BaseForm
      mode={mode}
      isLoading={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      onDelete={onDelete}
      title={isEdit ? "Edit User" : isView ? "View User" : "Create User"}
    >
      <Input
        label="Email"
        type="email"
        {...form.register("email")}
        error={form.formState.errors.email?.message}
        disabled={isView}
        placeholder="Enter user email"
      />

      {!isEdit && (
        <Input
          label="Password"
          type="password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
          disabled={isView}
          placeholder="Enter password"
        />
      )}
    </BaseForm>
  );
}
