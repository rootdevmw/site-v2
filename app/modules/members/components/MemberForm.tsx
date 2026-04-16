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
    },
  });

  const onSubmit = (data: MemberFormValues) => {
    const toastId = showLoading(
      isEdit ? "Updating member..." : "Creating member...",
    );

    if (isEdit && initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => {
            dismissToast(toastId);
            router.push("/members");
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
          router.push("/members");
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
          <option value="Visitor">Visitor</option>
          <option value="Member">Member</option>
          <option value="Baptized">Baptized</option>
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
