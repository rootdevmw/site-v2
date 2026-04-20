"use client";

import { useRouter } from "next/navigation";
import { NewsletterForm } from "@/app/modules/newsletters/components/NewsletterForm";

export default function NewNewsletterPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Add Newsletter
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create new church newsletter
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <NewsletterForm
          mode="create"
          initialData={{}}
          onSuccess={() => router.push("/dashboard/newsletters")}
        />
      </div>
    </div>
  );
}
