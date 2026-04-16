"use client";

import { useParams, useRouter } from "next/navigation";
import { useMinistry } from "@/app/modules/ministries/hooks/useMinistry";
import { useDeleteMinistry } from "@/app/modules/ministries/hooks/useDeleteMinistry";
import { MinistryForm } from "@/app/modules/ministries/components/MinistryForm";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditMinistryPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useMinistry(id as string);
  const { mutateAsync: deleteMinistry } = useDeleteMinistry();

  if (isLoading) return <SpiritualLoader />;

  const ministry = data?.data;

  if (!ministry) return <div>Not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Edit Ministry
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Update ministry details
          </p>
        </div>

        <button
          onClick={() => router.push(`/ministries/${ministry.id}`)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          View Details
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <MinistryForm
          mode="edit"
          initialData={{
            id: ministry.id,
            name: ministry.name,
            description: ministry.description,
            leaderId: ministry.leaderId,
            overseerId: ministry.overseerId || "",
          }}
          onDelete={async () => {
            await deleteMinistry(ministry.id);
            router.push("/ministries");
          }}
        />
      </div>
    </div>
  );
}
