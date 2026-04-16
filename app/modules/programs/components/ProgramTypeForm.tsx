"use client";

import { useForm } from "react-hook-form";
import { useCreateProgramType } from "../hooks/useCreateProgramType";

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="text-sm text-[var(--text-secondary)]">Name</label>
        <input
          {...register("name", { required: true })}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)]"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black"
      >
        {isPending ? "Saving..." : "Create"}
      </button>
    </form>
  );
}
