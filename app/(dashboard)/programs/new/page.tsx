"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ProgramForm } from "@/app/modules/programs/components/ProgramForm";
import { useProgramTemplates } from "@/app/modules/programTemplates/hooks/useProgramTemplates";
import { useCreateProgramFromTemplate } from "@/app/modules/programs/hooks/useCreateProgramFromTemplate";

import { DateInput } from "@/components/ui/DateInput";

export default function NewProgramPage() {
  const router = useRouter();

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [date, setDate] = useState("");

  const { data } = useProgramTemplates();
  const templates = data?.data || [];

  const { mutateAsync, isPending } = useCreateProgramFromTemplate();

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplateId || !date) return;

    const res = await mutateAsync({
      templateId: selectedTemplateId,
      date,
    });

    const program = res.data;

    router.push(`/programs/${program.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">New Program</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Create a new program or use a template
          </p>
        </div>

        <button
          onClick={() => setShowTemplateModal(true)}
          className="px-4 py-2 rounded-lg bg-[var(--card-elevated)] text-sm"
        >
          Use Template
        </button>
      </div>

      {/* Manual form */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <ProgramForm />
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Create from Template</h2>

            {/* Template select */}
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)]"
            >
              <option value="">Select template</option>
              {templates.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Date */}
            <DateInput
              label="Date"
              value={date}
              onValueChange={(v) => setDate(v)}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-sm text-[var(--text-secondary)]"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateFromTemplate}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black"
              >
                {isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
