"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateProgramTemplate } from "../hooks/useCreateProgramTemplate";
import { useUpdateProgramTemplate } from "../hooks/useUpdateProgramTemplate";
import { useProgramTypes } from "@/app/modules/programs/hooks/useProgramTypes";
import { useCreateProgramType } from "@/app/modules/programs/hooks/useCreateProgramType";
import {
  programTemplateSchema,
  ProgramTemplateFormValues,
} from "../validation/programTemplate.schema";

import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { showError, showSuccess } from "@/lib/toast";
import { useHomecells } from "@/app/modules/homecells/hooks/useHomecells";

export function ProgramTemplateForm({
  initialData,
  onSuccess,
  mode = "create",
  onDelete,
}: {
  initialData?: Partial<ProgramTemplateFormValues> & { id?: string };
  onSuccess?: (template: any) => void;
  mode?: "create" | "edit" | "view";
  onDelete?: () => void;
}) {
  const isView = mode === "view";

  const { mutateAsync: createTemplate, isPending } = useCreateProgramTemplate();
  const { mutateAsync: updateTemplate } = useUpdateProgramTemplate();

  const { data: typesData, isLoading: typesLoading } = useProgramTypes();
  const programTypes = typesData?.data || [];
  const { data: homecellsData, isLoading: homecellsLoading } = useHomecells({});
  const homecells = homecellsData?.data || [];

  const { mutateAsync: createType, isPending: creatingType } =
    useCreateProgramType();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProgramTemplateFormValues>({
    resolver: zodResolver(programTemplateSchema),
    defaultValues: initialData || {
      name: "",
      typeId: "",
      homecellId: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [showCreateType, setShowCreateType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;

    const res = await createType({ name: newTypeName });
    const created = res.data;

    setValue("typeId", created.id);
    setNewTypeName("");
    setShowCreateType(false);
  };

  const onSubmit = async (values: ProgramTemplateFormValues) => {
    const payload = {
      ...values,
      items: values.items.map((item, index) => ({
        ...item,
        sequence: index + 1,
      })),
    };

    try {
      const res =
        mode === "edit" && initialData?.id
          ? await updateTemplate({ id: initialData.id, data: payload })
          : await createTemplate(payload);

      showSuccess(
        mode === "edit"
          ? "Template updated successfully"
          : "Template created successfully",
      );
      onSuccess?.(res.data);
    } catch {
      showError("Failed to save template");
    }
  };

  return (
    <BaseForm
      mode={mode}
      isLoading={isPending}
      onSubmit={handleSubmit(onSubmit)}
      onDelete={onDelete}
      title={
        mode === "edit"
          ? "Edit Template"
          : mode === "view"
            ? "View Template"
            : "Create Template"
      }
    >
      <Input
        label="Template Name"
        {...register("name")}
        error={errors.name?.message}
        disabled={isView}
      />

      <Select
        label="Program Type"
        {...register("typeId")}
        error={errors.typeId?.message}
        disabled={isView}
      >
        <option value="">
          {typesLoading ? "Loading..." : "Select program type"}
        </option>

        {programTypes.map((type: any) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </Select>

      <Select
        label="Homecell"
        {...register("homecellId")}
        error={errors.homecellId?.message}
        disabled={isView}
      >
        <option value="">
          {homecellsLoading ? "Loading..." : "Select homecell"}
        </option>

        {homecells.map((homecell: any) => (
          <option key={homecell.id} value={homecell.id}>
            {homecell.name}
          </option>
        ))}
      </Select>

      {!isView &&
        (!showCreateType ? (
          <button
            type="button"
            onClick={() => setShowCreateType(true)}
            className="text-xs text-[var(--main-gold)] hover:underline"
          >
            + Add new type
          </button>
        ) : (
          <div className="p-3 rounded-lg border border-[var(--border-soft)] bg-[var(--card-elevated)] space-y-2">
            <input
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Type name"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-soft)]"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateType(false)}
                className="text-sm text-[var(--text-secondary)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateType}
                disabled={creatingType}
                className="px-3 py-1 rounded-md bg-[var(--main-gold)] text-black text-sm"
              >
                {creatingType ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        ))}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Template Items
        </h2>

        {fields.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">
            No items added yet
          </p>
        )}

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] space-y-3"
          >
            <Input
              label="Activity Title"
              {...register(`items.${index}.title` as const)}
              error={errors.items?.[index]?.title?.message}
              disabled={isView}
            />

            <Input
              label="Time"
              type="time"
              {...register(`items.${index}.time` as const)}
              error={errors.items?.[index]?.time?.message}
              disabled={isView}
            />

            <FormField
              label="Description"
              error={errors.items?.[index]?.description?.message}
            >
              <textarea
                disabled={isView}
                {...register(`items.${index}.description` as const)}
                placeholder="Description"
                className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)] text-sm outline-none"
              />
            </FormField>

            {!isView && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-400 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}

        {!isView && (
          <button
            type="button"
            onClick={() =>
              append({
                title: "",
                time: "",
                description: "",
              })
            }
            className="px-3 py-2 rounded-lg text-sm bg-[var(--card-elevated)]"
          >
            + Add Item
          </button>
        )}
      </div>
    </BaseForm>
  );
}
