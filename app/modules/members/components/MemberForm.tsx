"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberSchema, MemberFormValues } from "../types/member.types";
import { useCreateMember } from "../hooks/useCreateMember";
import { useUpdateMember } from "../hooks/useUpdateMember";
import { useHomecells } from "../hooks/useHomecells";
import { useMinistries } from "../hooks/useMinistries";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { BaseForm } from "@/components/ui/BaseForm";
import { dismissToast, showLoading } from "@/lib/toast";
import { DateInput } from "@/components/ui/DateInput";

export function MemberForm({
  mode = "create",
  initialData,
  onDelete,
}: {
  mode?: "create" | "edit" | "view";
  initialData?: Partial<MemberFormValues> & { id?: string };
  onDelete?: () => void;
}) {
  const router = useRouter();

  const createMutation = useCreateMember();
  const updateMutation = useUpdateMember();

  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: homecells } = useHomecells();
  const { data: ministries } = useMinistries();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: initialData || {
      ministryIds: [],
      isBaptized: false,
    },
  });

  const isBaptized = form.watch("isBaptized");

  const onSubmit = (data: MemberFormValues) => {
    const toastId = showLoading(
      isEdit ? "Updating member..." : "Creating member...",
    );

    if (!data.isBaptized) {
      data.baptismDate = undefined;
    }

    if (isEdit && initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            dismissToast(toastId);
            router.push("/dashboard/members");
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
          router.push("/dashboard/members");
        },
        onError: () => {
          dismissToast(toastId);
        },
      });
    }
  };

  const ministryList = ministries?.data || [];
  const homecellList = homecells?.data || [];

  return (
    <BaseForm
      mode={mode}
      isLoading={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      onDelete={onDelete}
      title={isEdit ? "Edit Member" : isView ? "View Member" : "Create Member"}
    >
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <Select
          label="Prefix"
          {...form.register("prefix")}
          error={form.formState.errors.prefix?.message}
          disabled={isView}
        >
          <option value="">Select prefix</option>
          <option value="PASTOR">Pastor</option>
          <option value="DEACON">Deacon</option>
          <option value="SISTER">Sister</option>
          <option value="BROTHER">Brother</option>
        </Select>
        <Input
          label="First Name"
          {...form.register("firstName")}
          error={form.formState.errors.firstName?.message}
          disabled={isView}
        />

        <Input
          label="Last Name"
          {...form.register("lastName")}
          error={form.formState.errors.lastName?.message}
          disabled={isView}
        />

        <Input
          label="Phone"
          {...form.register("phone")}
          error={form.formState.errors.phone?.message}
          disabled={isView}
        />

        <Input
          label="Location"
          {...form.register("location")}
          disabled={isView}
        />

        {/* Status */}
        <Select
          label="Status"
          {...form.register("status")}
          error={form.formState.errors.status?.message}
          disabled={isView}
        >
          <option value="">Select status</option>
          <option value="VISITOR">Visitor</option>
          <option value="MEMBER">Member</option>
        </Select>

        {/* Homecell */}
        <Select
          label="Homecell"
          {...form.register("homecellId")}
          error={form.formState.errors.homecellId?.message}
          disabled={isView}
        >
          <option value="">Select homecell</option>
          {homecellList.map((hc: { id: string; name: string }) => (
            <option key={hc.id} value={hc.id}>
              {hc.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Baptized Radio Buttons */}
      <div>
        <label className="text-sm text-[var(--text-secondary)] mb-2 block">
          Baptized
        </label>

        <div className="flex gap-3">
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map((option) => {
            const selected = isBaptized === option.value;

            return (
              <button
                key={option.label}
                type="button"
                disabled={isView}
                onClick={() => form.setValue("isBaptized", option.value)}
                className={`px-4 py-2 rounded-full text-sm border transition-all duration-200
                ${
                  selected
                    ? "bg-[var(--main-gold)] text-black border-[var(--gold-dark)]"
                    : "bg-[var(--card-elevated)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:bg-[var(--hover-soft)]"
                } ${isView ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Baptism Date (conditional) */}
      {isBaptized && (
        <DateInput
          type="date"
          label="Baptism Date"
          {...form.register("baptismDate")}
          error={form.formState.errors.baptismDate?.message}
          disabled={isView}
        />
      )}

      {/* Ministries */}
      <div>
        <label className="text-sm text-[var(--text-secondary)] mb-2 block">
          Ministries
        </label>

        <div className="flex flex-wrap gap-2">
          {ministryList.map(
            (m: { id: string; name: string }, index: number) => {
              const selected = form.watch("ministryIds")?.includes(m.id);

              return (
                <button
                  key={m.id ?? index}
                  type="button"
                  disabled={isView}
                  onClick={() => {
                    const current = form.getValues("ministryIds") || [];

                    if (selected) {
                      form.setValue(
                        "ministryIds",
                        current.filter((id) => id !== m.id),
                      );
                    } else {
                      form.setValue("ministryIds", [...current, m.id]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-all duration-200
                  ${
                    selected
                      ? "bg-[var(--main-gold)] text-black border-[var(--gold-dark)]"
                      : "bg-[var(--card-elevated)] text-[var(--text-secondary)] border-[var(--border-soft)] hover:bg-[var(--hover-soft)]"
                  } ${isView ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {m.name}
                </button>
              );
            },
          )}
        </div>
      </div>
    </BaseForm>
  );
}
