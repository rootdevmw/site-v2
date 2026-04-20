"use client";

import { useParams, useRouter } from "next/navigation";
import { ContentForm } from "@/app/modules/content/components/ContentForm";
import { useContent } from "@/app/modules/content/hooks/useContent";
import { useDeleteContent } from "@/app/modules/content/hooks/useDeleteContent";
import { showSuccess, showError } from "@/lib/toast";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditContentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useContent(id as string);
  const { mutateAsync: deleteContent } = useDeleteContent();

  if (isLoading) return <SpiritualLoader message="Loading Content...." />;

  const content = data?.data;

  // Transform content data to match form values
  const formData = content
    ? {
        ...content,
        typeId: content.type?.id,
        authorId: content.author?.id,
        tags: content.tags.map((tag: any) => tag.tag.name),
      }
    : undefined;

  const handleDelete = async () => {
    try {
      await deleteContent(id as string);
      showSuccess("Content deleted successfully");
      router.push("/dashboard/content");
    } catch {
      showError("Failed to delete content");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Edit Content
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Update content details
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <ContentForm
          mode="edit"
          initialData={formData}
          onSuccess={() => router.push("/content")}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
