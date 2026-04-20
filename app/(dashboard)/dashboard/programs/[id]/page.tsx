"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

import { useProgram } from "@/app/modules/programs/hooks/useProgram";

import { Info } from "@/components/ui/Info";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

import { ProgramDetails } from "@/app/modules/programs/components/ProgramDetails";

export default function ProgramDetailsPage() {
  const { id } = useParams();

  const { data, isLoading } = useProgram(id as string);

  const program = data?.data;

  if (isLoading || !program) {
    return <SpiritualLoader message="Loading program..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Program Details
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            View program structure and schedule
          </p>
        </div>

        <Link
          href={`/dashboard/programs/${program.id}/edit`}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition"
        >
          Edit Program
        </Link>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-4">
        <Info label="Date" value={program.date} />

        <Info label="Type" value={program.type?.name} />

        <Info
          label="Homecell"
          value={program.homecellId ? "Assigned" : "Church"}
        />
      </div>

      {/* Items */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Program Items
        </h2>

        <ProgramDetails program={program} />
      </div>
    </div>
  );
}
