"use client";

import { useRouter } from "next/navigation";

import { ProgramTemplateForm } from "@/app/modules/programTemplates/components/ProgramTemplateForm";

export default function NewProgramTemplatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          New Program Template
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create a reusable program structure
        </p>
      </div>

      {/* Form */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <ProgramTemplateForm
          onSuccess={(template) => {
            router.push(`/program-templates/${template.id}`);
          }}
        />
      </div>
    </div>
  );
}
