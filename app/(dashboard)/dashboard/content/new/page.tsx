"use client";

import { useRouter } from "next/navigation";
import { ContentForm } from "@/app/modules/content/components/ContentForm";

export default function NewContentPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Add Content
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create new church content
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <ContentForm
          mode="create"
          initialData={{}}
          onSuccess={() => router.push("/dashboard/content")}
        />
      </div>
    </div>
  );
}
