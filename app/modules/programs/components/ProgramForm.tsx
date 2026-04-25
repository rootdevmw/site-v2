"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useMembers } from "@/app/modules/members/hooks/useMembers";
import { useProgramTypes } from "../hooks/useProgramTypes";
import { useCreateProgram } from "../hooks/useCreateProgram";
import { useUpdateProgram } from "../hooks/useUpdateProgram";

import { useProgramTemplates } from "@/app/modules/programTemplates/hooks/useProgramTemplates";
import { useCreateProgramTemplate } from "../../programTemplates/hooks/useCreateProgramTemplate";
import { ProgramTemplate } from "@/app/modules/programTemplates/types/programTemplate.types";
import { programSchema, ProgramFormValues } from "../validation/program.schema";

import { DateInput } from "@/components/ui/DateInput";
import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

import { ProgramTypeForm } from "./ProgramTypeForm";
import { dismissToast, showError, showLoading, showSuccess } from "@/lib/toast";
import { toInputDate } from "@/lib/utils/date";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

// ---------------- SORTABLE ITEM ----------------
function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-start">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-4 px-1 cursor-grab touch-none text-[var(--text-secondary)] select-none"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ---------------- MAIN FORM ----------------
export function ProgramForm({
  initialData,
  mode = "create",
  onDelete,
}: {
  initialData?: any;
  mode?: "create" | "edit" | "view";
  onDelete?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);

  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const createTemplateMutation = useCreateProgramTemplate();

  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: membersData } = useMembers({ page: 1, limit: 100 });
  const { data: typesData } = useProgramTypes();
  const members = membersData?.data || [];
  const types = typesData?.data || [];

  const memberOptions = members.map((m: any) => ({
    label: `${m.firstName} ${m.lastName}`,
    value: m.id,
  }));

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: initialData
      ? {
          date: toInputDate(initialData.date),
          location: initialData.location,
          typeId: initialData.type?.id,
          homecellId: initialData.homecellId,
          items:
            initialData.items?.map((i: any) => ({
              title: i.title,
              description: i.description,
              time: i.time,
              responsibleId: i.responsible?.id,
            })) || [],
        }
      : {
          date: "",
          typeId: "",
          location: "",
          items: [],
        },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  });

  const { data: templatesData } = useProgramTemplates({
    homecellId: watch("homecellId"),
  });

  const templates: ProgramTemplate[] = templatesData?.data || [];
  function applyTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setValue("typeId", template.type.id);

    setValue(
      "items",
      template.items.map((item: any) => ({
        title: item.title,
        description: item.description,
        time: item.time,
        responsibleId: item.responsibleId,
      })),
    );
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    move(oldIndex, newIndex);
  }

  function hasConflict(items: ProgramFormValues["items"]) {
    const times = items.map((i) => i.time).filter(Boolean);
    return new Set(times).size !== times.length;
  }

  async function handleSaveAsTemplate() {
    const data = form.getValues();

    if (!data.typeId || !data.items.length) {
      showError("Program must have type and items to save as template");
      return;
    }

    const name = prompt("Enter template name");
    if (!name) return;

    createTemplateMutation.mutate({
      name,
      typeId: data.typeId,
      homecellId: data.homecellId,
      items: data.items.map((item, index) => ({
        ...item,
        sequence: index + 1,
      })),
    });
  }

  const onSubmit = (data: ProgramFormValues) => {
    if (hasConflict(data.items)) {
      showError("Two activities cannot have the same time");
      return;
    }

    const payload = {
      ...data,
      items: data.items.map((item, index) => ({
        ...item,
        sequence: index + 1,
      })),
    };

    const toastId = showLoading(
      isEdit ? "Updating program..." : "Creating program...",
    );

    const handleError = () => {
      dismissToast(toastId);
      showError("Failed to save program");
    };

    const handleSuccess = () => {
      dismissToast(toastId);
      showSuccess(isEdit ? "Program updated" : "Program created");
      router.push("/dashboard/programs");
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: initialData.id, data: payload },
        {
          onSuccess: handleSuccess,
          onError: handleError,
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    }
  };

  return (
    <>
      <BaseForm
        mode={mode}
        isLoading={isPending}
        onSubmit={handleSubmit(onSubmit)}
        onDelete={onDelete}
        title={
          isEdit ? "Edit Program" : isView ? "View Program" : "Create Program"
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInput
            label="Date"
            value={watch("date") || ""}
            onChange={(e) => setValue("date", e.target.value)}
            disabled={isView}
            error={errors.date?.message}
          />
          <Input
            label="Program Location"
            {...register("location")}
            error={errors.location?.message}
            disabled={isView}
          />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Program Type"
                {...register("typeId")}
                error={errors.typeId?.message}
                disabled={isView}
              >
                <option value="">Select type</option>
                {types.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            {!isView && (
              <button
                type="button"
                onClick={() => setShowAddTypeModal(true)}
                className="px-3 py-[9px] mb-0.5 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)] text-sm whitespace-nowrap"
              >
                + Add
              </button>
            )}
          </div>
        </div>

        <Select
          label="Use Template"
          onChange={(e) => applyTemplate(e.target.value)}
          disabled={isView}
        >
          <option value="">Select template</option>
          {templates.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>

        <div className="space-y-4">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <SortableItem key={field.id} id={field.id}>
                  <div className="p-4 rounded-xl border space-y-3">
                    <Input
                      label="Title"
                      {...register(`items.${index}.title`)}
                      error={errors.items?.[index]?.title?.message}
                      disabled={isView}
                    />

                    <Input
                      label="Time"
                      type="time"
                      {...register(`items.${index}.time`)}
                      error={errors.items?.[index]?.time?.message}
                      disabled={isView}
                    />

                    <SearchableSelect
                      label="Responsible"
                      options={memberOptions}
                      value={watch(`items.${index}.responsibleId`)}
                      onChange={(val) =>
                        setValue(`items.${index}.responsibleId`, val)
                      }
                      error={errors.items?.[index]?.responsibleId?.message}
                      disabled={isView}
                    />

                    {!isView && (
                      <button onClick={() => remove(index)} type="button">
                        Remove
                      </button>
                    )}
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          {!isView && (
            <button type="button" onClick={() => append({ title: "" })}>
              + Add Activity
            </button>
          )}
        </div>
      </BaseForm>

      {showAddTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add Program Type</h2>
              <button
                type="button"
                onClick={() => setShowAddTypeModal(false)}
                className="text-[var(--text-secondary)] text-xl leading-none"
              >
                ×
              </button>
            </div>
            <ProgramTypeForm
              onSuccess={(newType) => {
                queryClient.invalidateQueries({ queryKey: ["program-types"] });
                setValue("typeId", newType.id);
                setShowAddTypeModal(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
