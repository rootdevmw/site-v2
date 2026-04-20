"use client";

import { useState } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateContent } from "../hooks/useCreateContent";
import { useUpdateContent } from "../hooks/useUpdateContent";
import { useContentTypes } from "../hooks/useContentTypes";
import { useCreateContentType } from "../hooks/useCreateContentType";
import { useMembers } from "@/app/modules/members/hooks/useMembers";
import { contentSchema, ContentFormValues } from "../validation/content.schema";

import { BaseForm } from "@/components/ui/BaseForm";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormField } from "@/components/ui/FormField";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ContentViewer } from "@/components/ui/ContentViewer";
import { showSuccess, showError } from "@/lib/toast";

export function ContentForm({
  initialData,
  onSuccess,
  mode = "create",
  onDelete,
}: {
  initialData?: Partial<ContentFormValues> & { id?: string };
  onSuccess?: (content: any) => void;
  mode?: "create" | "edit" | "view";
  onDelete?: () => void;
}) {
  const isView = mode === "view";

  const { mutateAsync: createContent, isPending } = useCreateContent();
  const { mutateAsync: updateContent } = useUpdateContent();

  const { data: typesData, isLoading: typesLoading } = useContentTypes();
  const contentTypes = typesData?.data || [];

  const { data: membersData } = useMembers({ page: 1, limit: 100 });
  const members = membersData?.data || [];

  const { mutateAsync: createType, isPending: creatingType } =
    useCreateContentType();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema) as Resolver<ContentFormValues>,
    defaultValues: {
      title: initialData?.title ?? "",
      body: initialData?.body ?? "",
      typeId: initialData?.typeId ?? "",
      authorId: initialData?.authorId ?? "",
      tags: initialData?.tags ?? [],
      scriptures: initialData?.scriptures ?? [],
    },
  });

  const {
    fields: scriptureFields,
    append: appendScripture,
    remove: removeScripture,
  } = useFieldArray({
    control,
    name: "scriptures",
  });

  const [showCreateType, setShowCreateType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const memberOptions = members.map((m: any) => ({
    label: `${m.firstName} ${m.lastName}`,
    value: m.id,
  }));

  const handleCreateType = async () => {
    if (!newTypeName.trim()) return;

    try {
      const res = await createType({ name: newTypeName });
      setValue("typeId", res.data.id);
      setNewTypeName("");
      setShowCreateType(false);
    } catch {
      showError("Failed to create content type");
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const currentTags = watch("tags") || [];
      setValue("tags", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const currentTags = watch("tags") || [];
    setValue(
      "tags",
      currentTags.filter((_, i) => i !== index),
    );
  };

  const onSubmit = async (values: ContentFormValues) => {
    try {
      const res =
        mode === "edit" && initialData?.id
          ? await updateContent({ id: initialData.id, data: values })
          : await createContent(values);

      showSuccess(
        mode === "edit"
          ? "Content updated successfully"
          : "Content created successfully",
      );
      onSuccess?.(res.data);
    } catch {
      showError("Failed to save content");
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
          ? "Edit Content"
          : mode === "view"
            ? "View Content"
            : "Create Content"
      }
    >
      <Select
        label="Content Type"
        {...register("typeId")}
        error={errors.typeId?.message}
        disabled={isView}
      >
        <option value="">
          Select content type (sermon, teaching, blog, article, etc.)
        </option>
        {contentTypes.map((type: any) => (
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
            + Add new content type
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
      <Input
        label="Title"
        {...register("title")}
        error={errors.title?.message}
        disabled={isView}
      />
      <SearchableSelect
        label="Author"
        options={memberOptions}
        value={watch("authorId")}
        onChange={(val) => setValue("authorId", val)}
        error={errors.authorId?.message}
        disabled={isView}
      />
      {isView ? (
        <FormField label="Body">
          <div className="min-h-[200px] p-4 border border-[var(--border-soft)] rounded-lg bg-[var(--card-elevated)]">
            <ContentViewer content={watch("body") || ""} />
          </div>
        </FormField>
      ) : (
        <FormField label="Body" error={errors.body?.message}>
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="px-3 py-1 text-sm text-[var(--main-gold)] hover:underline"
              >
                {isPreview ? "Edit" : "Preview"}
              </button>
            </div>
            {isPreview ? (
              <div className="min-h-[200px] p-4 border border-[var(--border-soft)] rounded-lg bg-[var(--card-elevated)]">
                <ContentViewer content={watch("body") || ""} />
              </div>
            ) : (
              <RichTextEditor
                value={watch("body")}
                onChange={(value) => setValue("body", value)}
                error={errors.body?.message}
              />
            )}
          </div>
        </FormField>
      )}

      {/* Tags */}
      <FormField label="Tags" error={errors.tags?.message}>
        <div className="space-y-2">
          <input
            disabled={isView}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type a tag and press Enter"
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)] text-sm outline-none disabled:opacity-50"
          />
          <div className="flex flex-wrap gap-2">
            {(watch("tags") || []).map((tag, index) => (
              <div
                key={index}
                className="px-2 py-1 text-xs bg-[var(--main-gold)] text-black rounded-full flex items-center gap-2"
              >
                {tag}
                {!isView && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="hover:underline"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </FormField>

      {/* Scriptures */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Scriptures
        </h2>

        {scriptureFields.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">
            No scriptures added yet
          </p>
        )}

        {scriptureFields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] space-y-3"
          >
            <Input
              label="Book"
              {...register(`scriptures.${index}.book`)}
              error={errors.scriptures?.[index]?.book?.message}
              disabled={isView}
            />

            <Input
              label="Chapter"
              type="number"
              {...register(`scriptures.${index}.chapter`, {
                valueAsNumber: true,
              })}
              error={errors.scriptures?.[index]?.chapter?.message}
              disabled={isView}
            />

            <Input
              label="Verse From"
              type="number"
              {...register(`scriptures.${index}.verseFrom`, {
                valueAsNumber: true,
              })}
              error={errors.scriptures?.[index]?.verseFrom?.message}
              disabled={isView}
            />

            <Input
              label="Verse To (optional)"
              type="number"
              {...register(`scriptures.${index}.verseTo`, {
                valueAsNumber: true,
              })}
              error={errors.scriptures?.[index]?.verseTo?.message}
              disabled={isView}
            />

            {!isView && (
              <button
                type="button"
                onClick={() => removeScripture(index)}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {!isView && (
          <button
            type="button"
            onClick={() =>
              appendScripture({
                book: "",
                chapter: 1,
                verseFrom: 1,
              })
            }
            className="px-3 py-2 rounded-lg text-sm bg-[var(--card-elevated)]"
          >
            + Add Scripture
          </button>
        )}
      </div>
    </BaseForm>
  );
}
