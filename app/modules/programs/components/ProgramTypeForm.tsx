"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProgramType } from "../hooks/useCreateProgramType";
import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { showError, showSuccess } from "@/lib/toast";
import {
  programTypeSchema,
  ProgramTypeFormValues,
} from "../validation/programType.schema";

export function ProgramTypeForm({
  onSuccess,
}: {
  onSuccess?: (type: any) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProgramTypeFormValues>({
    resolver: zodResolver(programTypeSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutateAsync, isPending } = useCreateProgramType();

  const onSubmit = async (values: ProgramTypeFormValues) => {
    try {
      const res = await mutateAsync(values);
      showSuccess("Program type created successfully");
      onSuccess?.(res.data);
    } catch {
      showError("Failed to create program type");
    }
  };

  return (
    <BaseForm
      mode="create"
      isLoading={isPending}
      onSubmit={handleSubmit(onSubmit)}
      title="Create Program Type"
    >
      <Input label="Name" {...register("name")} error={errors.name?.message} />
    </BaseForm>
  );
}
