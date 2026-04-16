"use client";

import { useForm } from "react-hook-form";
import { useCreateProgramType } from "../hooks/useCreateProgramType";
import { BaseForm } from "@/components/ui/BaseForm";

type FormValues = {
  name: string;
};

export function ProgramTypeForm({
  onSuccess,
}: {
  onSuccess?: (type: any) => void;
}) {
  const { register, handleSubmit } = useForm<FormValues>();
  const { mutateAsync, isPending } = useCreateProgramType();

  const onSubmit = async (values: FormValues) => {
    const res = await mutateAsync(values);
    onSuccess?.(res.data);
  };

  return (
    <BaseForm
      mode="create"
      isLoading={isPending}
      onSubmit={handleSubmit(onSubmit)}
      title="Create Program Type"
    >
      <div>
        <label className="text-sm text-[var(--text-secondary)]">Name</label>
        <input
          {...register("name", { required: true })}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)]"
        />
      </div>
    </BaseForm>
  );
}
