import Link from "next/link";
import type { ReactNode } from "react";
import type { Publication } from "@/app/modules/publications/types/publication.types";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getPublicationFile } from "@/lib/utils/editorial-records";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordHistoryLink } from "./RecordHistoryLink";
import { PublicationPreview } from "./PublicationPreview";

export function PublicationRecordView({ publication, publishingAction }: { publication: Publication; publishingAction: ReactNode }) {
  const published = !!publication.publishedAt;
  const file = getPublicationFile(publication.fileUrl);
  return <RecordPage>
    <RecordHeader backHref="/dashboard/publications" backLabel="Back to publications" eyebrow="Church publication" title={publication.title}
      description="Documents and resources for the congregation." badges={<><RecordStatus tone={published ? "positive" : "warning"}>{published ? "Published" : "Draft"}</RecordStatus>{file.href && <span className="record-tag">{file.format}</span>}</>}
      actions={<>{publishingAction}<Link href={"/dashboard/publications/" + publication.id + "/edit"} className="record-button record-button-secondary">Edit publication</Link></>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="Document" description="Open the attached resource, or load an available preview."><PublicationPreview key={publication.fileUrl} fileUrl={publication.fileUrl} title={publication.title} /></RecordSection>
        <RecordSection title="About this publication"><p className="record-reader whitespace-pre-wrap leading-8 wrap-anywhere">{publication.description?.trim() || "No description has been added."}</p></RecordSection>
      </div>
      <aside className="record-stack record-aside" aria-label="Publication publishing and context">
        <RecordSection title="Publishing"><p className="record-empty">{published ? "This publication appears in the website’s publications list." : "This publication is a draft. Publish it when the document and description are ready."}</p>{published && <Link href="/publications" className="record-back !mb-0 mt-4">View public publications</Link>}</RecordSection>
        <RecordSection title="Publication details"><RecordFields>
          <RecordField label="Published">{publication.publishedAt ? formatChurchDate(publication.publishedAt, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" }) + " · Malawi time" : "Not published"}</RecordField>
          <RecordField label="Created">{formatChurchDate(publication.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField>
          <RecordField label="Attachment">{file.href ? file.format + " file" : "No usable file attached"}</RecordField>
        </RecordFields></RecordSection>
        <RecordSection title="Record details"><RecordFields><RecordField label="Publication ID">{publication.id}</RecordField></RecordFields><RecordHistoryLink entity="Publication" id={publication.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
