"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { useCreateProgramTemplate } from "../hooks/useCreateProgramTemplate";
import { useUpdateProgramTemplate } from "../hooks/useUpdateProgramTemplate";
import { useProgramTypes } from "@/app/modules/programs/hooks/useProgramTypes";
import { useCreateProgramType } from "@/app/modules/programs/hooks/useCreateProgramType";

import { Select } from "@/components/ui/Select";

type FormValues = {
  name: string;
  typeId: string;
  items: {
    title: string;
    description?: string;
    time?: string;
    sequence: number;
  }[];
};

export function ProgramTemplateForm({
  initialData,
  onSuccess,
  mode = "create",
  onDelete,
}: {
  initialData?: any;
  onSuccess?: (template: any) => void;
  mode?: "create" | "edit" | "view";
  onDelete?: () => void;
}) {
  const isView = mode === "view";

  // mutations
  const { mutateAsync: createTemplate, isPending } = useCreateProgramTemplate();
  const { mutateAsync: updateTemplate } = useUpdateProgramTemplate();

  const { data: typesData, isLoading: typesLoading } = useProgramTypes();
  const programTypes = typesData?.data || [];

  const { mutateAsync: createType, isPending: creatingType } =
    useCreateProgramType();

  // form
  const { register, control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: initialData || {
      name: "",
      typeId: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // inline type creation
  const [showCreateType, setShowCreateType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;

    const res = await createType({ name: newTypeName });
    const created = res.data;

    // ✅ auto-select
    setValue("typeId", created.id);

    setNewTypeName("");
    setShowCreateType(false);
  };

  // submit
  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      items: values.items.map((item, index) => ({
        ...item,
        sequence: index + 1,
      })),
    };

    let res;

    if (mode === "edit" && initialData?.id) {
      res = await updateTemplate({
        id: initialData.id,
        data: payload,
      });
    } else {
      res = await createTemplate(payload);
    }

    onSuccess?.(res.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label className="text-sm text-[var(--text-secondary)]">
          Template Name
        </label>
        <input
          disabled={isView}
          {...register("name", { required: true })}
          className="w-full mt-1 px-3 py-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)]"
        />
      </div>

      {/* Program Type */}
      <div className="space-y-2">
        <Select
          label="Program Type"
          disabled={isView}
          {...register("typeId", { required: true })}
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
      </div>

      {/* Items */}
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
            <input
              disabled={isView}
              {...register(`items.${index}.title` as const, {
                required: true,
              })}
              placeholder="Activity title"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)]"
            />

            <input
              disabled={isView}
              {...register(`items.${index}.time` as const)}
              placeholder="Time"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)]"
            />

            <textarea
              disabled={isView}
              {...register(`items.${index}.description` as const)}
              placeholder="Description"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)]"
            />

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
                sequence: fields.length + 1,
              })
            }
            className="px-3 py-2 rounded-lg text-sm bg-[var(--card-elevated)]"
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        {/* Delete */}
        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400"
          >
            Delete
          </button>
        )}

        {/* Submit */}
        {!isView && (
          <button
            type="submit"
            disabled={isPending}
            className="ml-auto px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black"
          >
            {isPending
              ? "Saving..."
              : mode === "edit"
                ? "Update Template"
                : "Create Template"}
          </button>
        )}
      </div>
    </form>
  );
}
