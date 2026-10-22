import Link from "next/link";
import type { ReactNode } from "react";
import type { Content } from "@/app/modules/content/types/content.types";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getContentState } from "@/lib/utils/editorial-records";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordHistoryLink } from "./RecordHistoryLink";
import { RecordRichText } from "./RecordRichText";

export function ContentRecordView({ content, publishingAction, authorLinkAllowed = false }: { content: Content; publishingAction: ReactNode; authorLinkAllowed?: boolean }) {
  const state = getContentState(content.status);
  const author = [content.author?.firstName, content.author?.lastName].filter(Boolean).join(" ");
  return <RecordPage>
    <RecordHeader backHref="/dashboard/content" backLabel="Back to content" eyebrow={content.type?.name || "Church content"} title={content.title}
      description={author ? "By " + author : "Author not assigned"} badges={<RecordStatus tone={state.tone}>{state.label}</RecordStatus>}
      actions={<>{publishingAction}<Link href={"/dashboard/content/" + content.id + "/edit"} className="record-button record-button-secondary">Edit content</Link></>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="Reading preview" description="Review the message before sharing it with the congregation.">
          <div className="record-reader"><RecordRichText content={content.body} emptyMessage="There is no message body yet. Add the message in Edit content." /></div>
          <details className="record-source"><summary>View HTML source</summary><pre tabIndex={0} aria-label="Message HTML source">{content.body || "No source content."}</pre></details>
        </RecordSection>
        <RecordSection title="Scripture references">
          {content.scriptures?.length ? <ul className="record-reference-list">{content.scriptures.map((scripture, index) => <li key={index}>{scripture.book} {scripture.chapter}:{scripture.verseFrom}{scripture.verseTo && scripture.verseTo > scripture.verseFrom ? "–" + scripture.verseTo : ""}</li>)}</ul> : <p className="record-empty">No scripture references have been added.</p>}
        </RecordSection>
      </div>
      <aside className="record-stack record-aside" aria-label="Content publishing and context">
        <RecordSection title="Publishing">
          <p className="record-empty">{state.next === "Draft" ? "This message is published on the church website." : state.next === "Published" ? "This is a draft. Publish it when the message is ready to share." : "Review this record’s status before publishing."}</p>
          {state.next === "Draft" && content.slug && <Link href={"/content/" + encodeURIComponent(content.slug)} className="record-back !mb-0 mt-4">View public message</Link>}
        </RecordSection>
        <RecordSection title="Message details"><RecordFields>
          <RecordField label="Author">{author && (authorLinkAllowed && content.author?.id ? <Link href={"/dashboard/members/" + content.author.id}>{author}</Link> : author)}</RecordField>
          <RecordField label="Content type">{content.type?.name}</RecordField>
          <RecordField label="Created">{formatChurchDate(content.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField>
        </RecordFields></RecordSection>
        <RecordSection title="Tags">{content.tags?.length ? <ul className="flex flex-wrap gap-2">{content.tags.map((tag, index) => <li key={tag.id || index} className="record-tag">{tag.tag?.name || "Unnamed tag"}</li>)}</ul> : <p className="record-empty">No tags have been added.</p>}</RecordSection>
        <RecordSection title="Record details"><RecordFields><RecordField label="Content ID">{content.id}</RecordField></RecordFields><RecordHistoryLink entity="Content" id={content.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
