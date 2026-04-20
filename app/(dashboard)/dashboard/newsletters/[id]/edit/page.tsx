"use client";

import { useParams, useRouter } from "next/navigation";
import { NewsletterForm } from "@/app/modules/newsletters/components/NewsletterForm";
import { useNewsletter } from "@/app/modules/newsletters/hooks/useNewsletter";
import { useDeleteNewsletter } from "@/app/modules/newsletters/hooks/useDeleteNewsletter";
import { showSuccess, showError } from "@/lib/toast";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditNewsletterPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useNewsletter(id as string);
  const { mutateAsync: deleteNewsletter } = useDeleteNewsletter();

  if (isLoading) return <SpiritualLoader message="Loading Newsletter..." />;

  const newsletter = data?.data;

  const handleDelete = async () => {
    try {
      await deleteNewsletter(id as string);
      showSuccess("Newsletter deleted successfully");
      router.push("/newsletters");
    } catch {
      showError("Failed to delete newsletter");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Edit Newsletter
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Update newsletter details
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <NewsletterForm
          mode="edit"
          initialData={newsletter}
          onSuccess={() => router.push("/dashboard/newsletters")}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
