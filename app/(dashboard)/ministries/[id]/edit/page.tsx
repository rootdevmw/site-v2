"use client";

import { useParams } from "next/navigation";
import { useMinistry } from "@/app/modules/ministries/hooks/useMinistry";
import { MinistryForm } from "@/app/modules/ministries/components/MinistryForm";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditMinistryPage() {
  const { id } = useParams();

  const { data, isLoading } = useMinistry(id as string);

  if (isLoading) return <SpiritualLoader />;

  const ministry = data?.data;

  if (!ministry) return <div>Not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Edit Ministry</h1>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <MinistryForm
          id={ministry.id}
          initialData={{
            name: ministry.name,
            description: ministry.description,
            leaderId: ministry.leaderId,
            overseerId: ministry.overseerId || "",
          }}
        />
      </div>
    </div>
  );
}
