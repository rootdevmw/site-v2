"use client";

import { useParams, useRouter } from "next/navigation";
import { useProgram } from "@/app/modules/programs/hooks/useProgram";
import { useDeleteProgram } from "@/app/modules/programs/hooks/useDeleteProgram";
import { ProgramForm } from "@/app/modules/programs/components/ProgramForm";
import type { ProgramItem } from "@/app/modules/programs/types/program.types";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditProgramPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, isError } = useProgram(id as string);
  const { mutateAsync: deleteProgram } = useDeleteProgram();

  if (isLoading) {
    return <SpiritualLoader message="Loading Program" />;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load program
        <button
          onClick={() => router.push("/dashboard/programs")}
          className="ml-3 text-[var(--blue)] hover:opacity-90 transition-all duration-200"
        >
          Go back
        </button>
      </div>
    );
  }

  const program = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Edit Program
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Update program details
          </p>
        </div>

        <button
          onClick={() => router.push(`/dashboard/programs/${program.id}`)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          View Details
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <ProgramForm
          mode="edit"
          initialData={{
            id: program.id,
            date: program.date,
            typeId: program.type?.id || "",
            homecellId: program.homecell?.id || undefined,
            items:
              program.items?.map((item: ProgramItem) => ({
                title: item.title,
                time: item.time,
                responsibleId: item.responsible?.id || "",
              })) || [],
          }}
          onDelete={async () => {
            await deleteProgram(program.id);
            router.push("/dashboard/programs");
          }}
        />
      </div>
    </div>
  );
}
