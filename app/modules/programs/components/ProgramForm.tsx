"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useRouter } from "next/navigation";

import { useMembers } from "@/app/modules/members/hooks/useMembers";
import { useProgramTypes } from "../hooks/useProgramTypes";
import { useCreateProgram } from "../hooks/useCreateProgram";
import { useUpdateProgram } from "../hooks/useUpdateProgram";

import { useProgramTemplates } from "@/app/modules/programTemplates/hooks/useProgramTemplates";
import { useCreateProgramTemplate } from "../../programTemplates/hooks/useCreateProgramTemplate";
import { ProgramTemplate } from "@/app/modules/programTemplates/types/programTemplate.types";

import { DateInput } from "@/components/ui/DateInput";
import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

import { dismissToast, showLoading } from "@/lib/toast";
import { toInputDate } from "@/lib/utils/date";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

// ---------------- TYPES ----------------
type ProgramFormValues = {
  date: string;
  typeId: string;
  homecellId?: string;
  items: {
    title: string;
    description?: string;
    time?: string;
    responsibleId?: string;
  }[];
};

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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
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

  // ---------------- FORM ----------------
  const form = useForm<ProgramFormValues>({
    defaultValues: initialData
      ? {
          date: toInputDate(initialData.date),
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
          items: [],
        },
  });

  const { register, control, handleSubmit, setValue, watch } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "items",
  });

  // ---------------- TEMPLATES ----------------
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

  // ---------------- DnD ----------------
  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    move(oldIndex, newIndex);
  }

  // ---------------- VALIDATION ----------------
  function hasConflict(items: ProgramFormValues["items"]) {
    const times = items.map((i) => i.time).filter(Boolean);
    return new Set(times).size !== times.length;
  }

  // ---------------- SAVE AS TEMPLATE ----------------
  function handleSaveAsTemplate() {
    const data = form.getValues();

    if (!data.typeId || !data.items.length) {
      alert("Program must have type and items to save as template");
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

  // ---------------- SUBMIT ----------------
  const onSubmit = (data: ProgramFormValues) => {
    if (hasConflict(data.items)) {
      alert("Two activities cannot have the same time");
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

    if (isEdit) {
      updateMutation.mutate(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            dismissToast(toastId);
            router.push("/programs");
          },
          onError: () => dismissToast(toastId),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          dismissToast(toastId);
          router.push("/programs");
        },
        onError: () => dismissToast(toastId),
      });
    }
  };

  // ---------------- UI ----------------
  return (
    <BaseForm
      mode={mode}
      isLoading={isPending}
      onSubmit={handleSubmit(onSubmit)}
      onDelete={onDelete}
      title={
        isEdit ? "Edit Program" : isView ? "View Program" : "Create Program"
      }
    >
      {/* Top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          label="Date"
          value={watch("date") || ""}
          onValueChange={(value) => setValue("date", value)}
          disabled={isView}
        />

        <Select label="Program Type" {...register("typeId")} disabled={isView}>
          <option value="">Select type</option>
          {types.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Template */}
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

      {/* Items */}
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
                    disabled={isView}
                  />

                  <Input
                    label="Time"
                    type="time"
                    {...register(`items.${index}.time`)}
                    disabled={isView}
                  />

                  <SearchableSelect
                    label="Responsible"
                    options={memberOptions}
                    value={watch(`items.${index}.responsibleId`)}
                    onChange={(val) =>
                      setValue(`items.${index}.responsibleId`, val)
                    }
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
  );
}
