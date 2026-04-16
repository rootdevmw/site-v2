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

import { useRouter } from "next/navigation";
import { dismissToast, showLoading } from "@/lib/toast";

export function HomecellForm({
  initialData,
  id,
}: {
  initialData?: Partial<HomecellFormValues>;
  id?: string;
}) {
  const router = useRouter();

  const createMutation = useCreateHomecell();
  const updateMutation = useUpdateHomecell();

  const isEdit = !!id;
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

    if (isEdit) {
      updateMutation.mutate(
        { id: id!, data: values },
        {
          onSuccess: () => {
            dismissToast(toastId);
            router.push("/homecells");
          },
          onError: () => dismissToast(toastId),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          dismissToast(toastId);
          router.push("/homecells");
        },
        onError: () => dismissToast(toastId),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Homecell Name"
          {...form.register("name")}
          error={form.formState.errors.name?.message}
        />

        <Input
          label="Location"
          {...form.register("location")}
          error={form.formState.errors.location?.message}
        />

        {/* Leader */}
        <SearchableSelect
          label="Leader (Deacon)"
          options={memberOptions}
          value={form.watch("leaderId")}
          onChange={(val) => form.setValue("leaderId", val)}
          error={form.formState.errors.leaderId?.message}
        />

        {/* Overseer */}
        <SearchableSelect
          label="Overseer (Pastor)"
          options={memberOptions}
          value={form.watch("overseerId")}
          onChange={(val) => form.setValue("overseerId", val)}
          error={form.formState.errors.overseerId?.message}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200 disabled:opacity-60"
        >
          {isPending
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
              ? "Update Homecell"
              : "Create Homecell"}
        </button>
      </div>
    </form>
  );
}
