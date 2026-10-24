import Link from "next/link";
import type { ReactNode } from "react";
import { FiEdit2, FiList } from "react-icons/fi";
import type { ProgramTemplate } from "@/app/modules/programTemplates/types/programTemplate.types";
import { ProgramDetails } from "@/app/modules/programs/components/ProgramDetails";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getProgramSummary } from "@/lib/utils/program-records";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordHistoryLink } from "./RecordHistoryLink";
import { ProgramSummary } from "./ProgramRecordView";

export function ProgramTemplateRecordView({ template, useTemplateAction }: { template: ProgramTemplate; useTemplateAction: ReactNode }) {
  const homecellId = template.homecell?.id || template.homecellId;
  return <RecordPage>
    <RecordHeader backHref="/dashboard/program-templates" backLabel="Back to templates" eyebrow="Program template" title={template.name}
      description="A reusable order of activities. Choose a date when creating a program from this template."
      identity={<div className="record-program-date"><FiList aria-hidden="true" className="size-8" /></div>}
      badges={<><RecordStatus tone="info">Reusable template</RecordStatus><RecordStatus>{homecellId ? "Homecell template" : "Church-wide template"}</RecordStatus></>}
      actions={<>{useTemplateAction}<Link href={"/dashboard/program-templates/" + encodeURIComponent(template.id) + "/edit"} className="record-button record-button-secondary"><FiEdit2 aria-hidden="true" />Edit template</Link></>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack"><RecordSection title="Template activities" description="The sequence, times, descriptions, and assigned people copied into a new program."><ProgramSummary summary={getProgramSummary(template.items)} /><ProgramDetails program={template} emptyMessage="This template has no activities yet. Edit the template to build its order of service." /></RecordSection></div>
      <aside className="record-stack record-aside" aria-label="Template use and connections">
        <RecordSection title="Using this template"><p className="record-empty">Use this template to create a separate program for a date you choose. It copies the program type, homecell, and activity details. You can then edit the new program.</p><p className="record-empty mt-3">Editing this template does not update programs already created from it.</p></RecordSection>
        <RecordSection title="Template details"><RecordFields>
          <RecordField label="Program type">{template.type?.name}</RecordField>
          <RecordField label="Homecell">{homecellId ? <Link href={"/dashboard/homecells/" + encodeURIComponent(homecellId)}>{template.homecell?.name || "Assigned homecell"}</Link> : "Church-wide"}</RecordField>
          <RecordField label="Program date">Chosen when creating a program</RecordField>
        </RecordFields></RecordSection>
        <RecordSection title="Record details"><RecordFields><RecordField label="Created" fallback="Creation date not recorded">{template.createdAt && formatChurchDate(template.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField><RecordField label="Template ID">{template.id}</RecordField></RecordFields><RecordHistoryLink entity="ProgramTemplate" id={template.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
