"use client";

import { useRouter } from "next/navigation";
import { ProgramTypeForm } from "@/app/modules/programs/components/ProgramTypeForm";

export default function NewProgramTypePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Program Type</h1>
      </div>

      <ProgramTypeForm onSuccess={(type) => router.push(`/program-types`)} />
    </div>
  );
}
