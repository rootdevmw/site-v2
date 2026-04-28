"use client";

import { useRouter } from "next/navigation";
import { PublicationForm } from "@/app/modules/publications/components/PublicationForm";

export default function NewPublicationPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Add Publication
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create new church publication
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <PublicationForm
          mode="create"
          initialData={{}}
          onSuccess={() => router.push("/dashboard/publications")}
        />
      </div>
    </div>
  );
}
