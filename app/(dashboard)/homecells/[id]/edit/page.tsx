"use client";

import { useParams, useRouter } from "next/navigation";
import { useHomecell } from "@/app/modules/homecells/hooks/useHomecell";
import { useDeleteHomecell } from "@/app/modules/homecells/hooks/useDeleteHomecell";
import { HomecellForm } from "@/app/modules/homecells/components/HomecellForm";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditHomecellPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useHomecell(id as string);
  const { mutateAsync: deleteHomecell } = useDeleteHomecell();

  if (isLoading || !data?.data)
    return <SpiritualLoader message="Loading homecell..." />;

  const homecell = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Edit Homecell
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Update homecell details
          </p>
        </div>

        <button
          onClick={() => router.push(`/homecells/${homecell.id}`)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          View Details
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <HomecellForm
          mode="edit"
          initialData={{
            id: homecell.id,
            name: homecell.name,
            location: homecell.location,
            leaderId: homecell.leader?.id || "",
            overseerId: homecell.overseer?.id || "",
          }}
          onDelete={async () => {
            await deleteHomecell(homecell.id);
            router.push("/homecells");
          }}
        />
      </div>
    </div>
  );
}
