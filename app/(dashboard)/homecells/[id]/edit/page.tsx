"use client";

import { useParams } from "next/navigation";
import { useHomecell } from "@/app/modules/homecells/hooks/useHomecell";
import { HomecellForm } from "@/app/modules/homecells/components/HomecellForm";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditHomecellPage() {
  const { id } = useParams();

  const { data, isLoading } = useHomecell(id as string);

  if (isLoading || !data?.data)
    return <SpiritualLoader message="Loading homecell..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Edit Homecell
        </h1>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <HomecellForm id={id as string} initialData={data.data} />
      </div>
    </div>
  );
}
