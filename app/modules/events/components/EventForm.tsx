"use client";

import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateEvent } from "../hooks/useCreateEvent";
import { useUpdateEvent } from "../hooks/useUpdateEvent";
import { useEventTypes } from "../hooks/useEventTypes";
import { useCreateEventType } from "../hooks/useCreateEventType";
import { useMinistries } from "@/app/modules/ministries/hooks/useMinistries";
import { eventSchema, EventFormValues } from "../validation/event.schema";
import type { Event, EventType, Ministry } from "../types/event.types";

import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { DateInput } from "@/components/ui/DateInput";
import { showSuccess, showError } from "@/lib/toast";

type EventFormInitialData = Partial<
  Omit<EventFormValues, "description" | "location">
> & {
  id?: string;
  description?: string | null;
  location?: string | null;
};

export function EventForm({
  initialData,
  onSuccess,
  mode = "create",
  onDelete,
}: {
  initialData?: EventFormInitialData;
  onSuccess?: (event: Event) => void;
  mode?: "create" | "edit" | "view";
  onDelete?: () => void;
}) {
  const isView = mode === "view";

  const { mutateAsync: createEvent, isPending } = useCreateEvent();
  const { mutateAsync: updateEvent } = useUpdateEvent();
  const { mutateAsync: createEventType, isPending: creatingEventType } =
    useCreateEventType();

  const { data: typesData, isLoading: typesLoading } = useEventTypes();
  const eventTypes = typesData?.data || [];

  const { data: ministriesData } = useMinistries({ page: 1, limit: 100 });
  const ministries = (ministriesData?.data || []) as Ministry[];

  const [showCreateType, setShowCreateType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as Resolver<EventFormValues>,
    defaultValues: {
      title: initialData?.title ?? "",
      typeId: initialData?.typeId ?? "",
      ministryIds: initialData?.ministryIds ?? [],
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      startTime: initialData?.startTime ?? "",
      endTime: initialData?.endTime ?? "",
    },
  });
  const ministryIds = useWatch({ control, name: "ministryIds" }) || [];

  const ministryOptions = ministries.map((m: Ministry) => ({
    label: m.name,
    value: m.id,
  }));

  const handleCreateEventType = async () => {
    const name = newTypeName.trim();

    if (!name) return;

    try {
      const res = await createEventType({ name });
      setValue("typeId", res.data.id);
      setNewTypeName("");
      setShowCreateType(false);
    } catch {
      showError("Failed to create event type");
    }
  };

  const onSubmit = async (values: EventFormValues) => {
    try {
      const data = {
        ...values,
        ministryIds: values.ministryIds || [],
      };

      const res =
        mode === "edit" && initialData?.id
          ? await updateEvent({ id: initialData.id, data })
          : await createEvent(data);

      showSuccess(
        mode === "edit"
          ? "Event updated successfully"
          : "Event created successfully",
      );
      onSuccess?.(res.data);
    } catch {
      showError("Failed to save event");
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
          ? "Edit Event"
          : mode === "view"
            ? "View Event"
            : "Create Event"
      }
    >
      <Input
        label="Title"
        {...register("title")}
        error={errors.title?.message}
        disabled={isView}
      />

      <Input
        label="Description (optional)"
        {...register("description")}
        error={errors.description?.message}
        disabled={isView}
      />

      <Input
        label="Location (optional)"
        {...register("location")}
        error={errors.location?.message}
        disabled={isView}
      />

      <Select
        label="Event Type"
        {...register("typeId")}
        error={errors.typeId?.message}
        disabled={isView || typesLoading}
      >
        <option value="">Select event type</option>
        {eventTypes.map((type: EventType) => (
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
            + Add new event type
          </button>
        ) : (
          <div className="p-3 rounded-lg border border-[var(--border-soft)] bg-[var(--card-elevated)] space-y-2">
            <input
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Event type name"
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
                onClick={handleCreateEventType}
                disabled={creatingEventType || !newTypeName.trim()}
                className="px-3 py-1 rounded-md bg-[var(--main-gold)] text-black text-sm disabled:opacity-50"
              >
                {creatingEventType ? "Saving..." : "Create"}
              </button>
            </div>
          </div>
        ))}

      <MultiSelect
        label="Ministries (leave empty for all)"
        options={ministryOptions}
        value={ministryIds}
        onChange={(vals) => setValue("ministryIds", vals)}
        error={errors.ministryIds?.message}
        disabled={isView}
      />

      <DateInput
        label="Start Date & Time"
        type="datetime-local"
        {...register("startTime")}
        error={errors.startTime?.message}
        disabled={isView}
      />

      <DateInput
        label="End Date & Time"
        type="datetime-local"
        {...register("endTime")}
        error={errors.endTime?.message}
        disabled={isView}
      />
    </BaseForm>
  );
}
