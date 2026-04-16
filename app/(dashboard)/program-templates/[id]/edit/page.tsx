"use client";

import { useParams, useRouter } from "next/navigation";

import { useProgramTemplate } from "@/app/modules/programTemplates/hooks/useProgramTemplate";
import { useDeleteProgramTemplate } from "@/app/modules/programTemplates/hooks/useDeleteProgramTemplate";

import { ProgramTemplateForm } from "@/app/modules/programTemplates/components/ProgramTemplateForm";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditProgramTemplatePage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useProgramTemplate(id as string);
  const { mutateAsync: deleteTemplate } = useDeleteProgramTemplate();

  const template = data?.data;

  if (isLoading || !template) {
    return <SpiritualLoader message="Loading template..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Template</h1>
      </div>

      <ProgramTemplateForm
        mode="edit"
        initialData={template}
        onSuccess={() => router.push(`/program-templates/${template.id}`)}
        onDelete={async () => {
          await deleteTemplate(template.id);
          router.push("/program-templates");
        }}
      />
    </div>
  );
}
