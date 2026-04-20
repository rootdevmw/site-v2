"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ProgramForm } from "@/app/modules/programs/components/ProgramForm";
import { useProgramTemplates } from "@/app/modules/programTemplates/hooks/useProgramTemplates";
import { useProgramTemplate } from "@/app/modules/programTemplates/hooks/useProgramTemplate";
import { useCreateProgramFromTemplate } from "@/app/modules/programs/hooks/useCreateProgramFromTemplate";
import { useMembers } from "@/app/modules/members/hooks/useMembers";

import { DateInput } from "@/components/ui/DateInput";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

export default function NewProgramPage() {
  const router = useRouter();

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [date, setDate] = useState("");
  const [responsibleOverrides, setResponsibleOverrides] = useState<
    Record<number, string>
  >({});

  const { data } = useProgramTemplates();
  const templates = data?.data || [];

  const { data: templateDetail } = useProgramTemplate(selectedTemplateId);
  const selectedTemplate = templateDetail as any;

  const { data: membersData } = useMembers({ page: 1, limit: 100 });
  const members = (membersData?.data || []) as any[];
  const memberOptions = members.map((m) => ({
    label: `${m.firstName} ${m.lastName}`,
    value: m.id,
  }));

  const { mutateAsync, isPending } = useCreateProgramFromTemplate();

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplateId || !date) return;

    const items =
      selectedTemplate?.items?.map((item: any, index: number) => ({
        sequence: item.sequence,
        responsibleId: responsibleOverrides[index] ?? item.responsibleId,
      })) ?? [];

    const res = await mutateAsync({
      templateId: selectedTemplateId,
      date,
      items: items.filter((i: any) => i.responsibleId),
    });

    const program = (res as any).data;
    router.push(`/dashboard/programs/${program.id}`);
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <ProgramForm mode="create" initialData={{}} />
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">Create from Template</h2>

            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                setResponsibleOverrides({});
              }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-elevated)] border border-[var(--border-soft)] text-sm"
            >
              <option value="">Select template</option>
              {templates.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <DateInput
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {selectedTemplate?.items?.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Assign Responsible Persons
                </p>
                {selectedTemplate.items.map((item: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <p className="text-xs font-medium">{item.title}</p>
                    <SearchableSelect
                      label=""
                      options={memberOptions}
                      value={responsibleOverrides[index] ?? item.responsibleId ?? ""}
                      onChange={(val) =>
                        setResponsibleOverrides((prev) => ({
                          ...prev,
                          [index]: val,
                        }))
                      }
                      placeholder="Select responsible person"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-sm text-[var(--text-secondary)]"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateFromTemplate}
                disabled={isPending || !selectedTemplateId || !date}
                className="px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black text-sm disabled:opacity-50"
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
