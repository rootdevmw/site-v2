"use client";

import Link from "next/link";

import { useProgramTemplate } from "@/app/modules/programTemplates/hooks/useProgramTemplate";
import { ProgramDetails } from "@/app/modules/programs/components/ProgramDetails";

import { Info } from "@/components/ui/Info";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export function ProgramTemplateDetailsClient({ id }: { id: string }) {
  const { data, isLoading } = useProgramTemplate(id);

  const template = data?.data;

  if (isLoading || !template) {
    return <SpiritualLoader message="Loading template..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {template.name}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Program template structure
          </p>
        </div>

        <Link
          href={`/dashboard/program-templates/${template.id}/edit`}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition"
        >
          Edit Template
        </Link>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-4">
        <Info label="Type" value={template.type?.name} />
        <Info label="Items" value={template.items?.length} />
      </div>

      {/* Items */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Template Items
        </h2>

        <ProgramDetails program={template} />
      </div>
    </div>
  );
}
