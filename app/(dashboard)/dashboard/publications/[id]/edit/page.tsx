"use client";

import { useParams, useRouter } from "next/navigation";
import { PublicationForm } from "@/app/modules/publications/components/PublicationForm";
import { usePublication } from "@/app/modules/publications/hooks/usePublication";
import { useDeletePublication } from "@/app/modules/publications/hooks/useDeletePublication";
import { showSuccess, showError } from "@/lib/toast";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditPublicationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = usePublication(id as string);
  const { mutateAsync: deletePublication } = useDeletePublication();

  if (isLoading) return <SpiritualLoader message="Loading Publication..." />;

  const publication = data?.data;

  const handleDelete = async () => {
    try {
      await deletePublication(id as string);
      showSuccess("Publication deleted successfully");
      router.push("/publications");
    } catch {
      showError("Failed to delete publication");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Edit Publication
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Update Publication details
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <PublicationForm
          mode="edit"
          initialData={publication}
          onSuccess={() => router.push("/dashboard/publications")}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
