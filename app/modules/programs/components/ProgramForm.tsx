"use client";
import {
  ProgramEditor,
  type ProgramEditorProps,
} from "@/components/records/ProgramEditor";
import type { getProgramEditorValues } from "@/lib/utils/program-records";
export function ProgramForm({
  initialData,
  ...props
}: Omit<ProgramEditorProps, "initialData"> & {
  initialData?: Partial<ReturnType<typeof getProgramEditorValues>>;
}) {
  const people = initialData?.items?.flatMap((item) =>
    item.responsible
      ? [
          {
            id: item.responsible.id,
            name:
              [item.responsible.firstName, item.responsible.lastName]
                .filter(Boolean)
                .join(" ") || "Current profile #" + item.responsible.id,
          },
        ]
      : [],
  );
  return (
    <ProgramEditor
      {...props}
      kind="program"
      initialType={initialData?.type}
      initialHomecell={initialData?.homecell}
      initialPeople={people}
      initialData={{
        id: initialData?.id,
        date: initialData?.date,
        location: initialData?.location || "",
        typeId: initialData?.type?.id || "",
        homecellId: initialData?.homecellId || "",
        items:
          initialData?.items?.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description || "",
            time: item.time || "",
            responsibleId: item.responsibleId || item.responsible?.id || "",
          })) || [],
      }}
    />
  );
}
