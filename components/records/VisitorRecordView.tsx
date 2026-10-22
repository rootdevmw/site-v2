import type { ReactNode } from "react";
import { FiCalendar, FiMail, FiPhone } from "react-icons/fi";
import type { Visitor } from "@/app/modules/attention/types/attention.types";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getPhoneHref, getVisitorState } from "@/lib/utils/record-details";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordHistoryLink } from "./RecordHistoryLink";

export function VisitorRecordView({ visitor, followUpAction, feedback }: { visitor: Visitor; followUpAction: ReactNode; feedback?: ReactNode }) {
  const state = getVisitorState(visitor.status);
  const phoneHref = getPhoneHref(visitor.phone);
  const hasDate = Number.isFinite(new Date(visitor.visitDate).getTime());
  const date = (value: string) => formatChurchDate(value, { day: "numeric", month: "long", year: "numeric" });
  return <RecordPage>
    <RecordHeader backHref="/dashboard/attention/visitors" backLabel="Back to visitors" eyebrow="Visitor welcome" title={visitor.name?.trim() || "Unnamed visitor"}
      description={"Planned visit: " + date(visitor.visitDate)}
      identity={<div className="flex size-24 flex-col items-center justify-center rounded-2xl border border-[#e3d4bc] bg-[#f3e8d6] text-[#743c21]" aria-label={hasDate ? date(visitor.visitDate) : "Visit date to confirm"}>{hasDate ? <><span className="text-xs font-bold uppercase tracking-widest">{formatChurchDate(visitor.visitDate, { month: "short" })}</span><span className="mt-1 text-4xl font-semibold leading-none tracking-tight">{formatChurchDate(visitor.visitDate, { day: "numeric" })}</span><span className="mt-1 text-xs">{formatChurchDate(visitor.visitDate, { year: "numeric" })}</span></> : <FiCalendar aria-hidden="true" className="size-8" />}</div>}
      badges={<><RecordStatus tone={state.tone}>{state.label}</RecordStatus>{visitor.hasSpecialNeeds && <RecordStatus tone="warning">Support requested</RecordStatus>}</>}
      actions={followUpAction}
    />
    {feedback && <div className="mt-5">{feedback}</div>}
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="The visit" description="Visit dates use Malawi time."><RecordFields>
          <RecordField label="Planned visit date">{date(visitor.visitDate)}</RecordField>
          <RecordField label="Group size">{visitor.groupSize}</RecordField>
          <RecordField label="Preferred language" fallback="No preference given">{visitor.language}</RecordField>
          <RecordField label="Church of Christ member" fallback="Not specified">{visitor.isChurchOfChrist}</RecordField>
        </RecordFields></RecordSection>
        <RecordSection title="A message from the visitor"><p className={visitor.message ? "whitespace-pre-wrap text-base leading-8 wrap-anywhere" : "record-empty"}>{visitor.message || "No additional message was shared."}</p></RecordSection>
        <RecordSection title="Accessibility & support"><RecordFields>
          <RecordField label="Support requested">{visitor.hasSpecialNeeds ? "Yes" : "No"}</RecordField>
        </RecordFields>{visitor.hasSpecialNeeds && <p className="mt-4 whitespace-pre-wrap text-sm leading-8 wrap-anywhere">{visitor.specialNeedsDetails || "No further details were provided. Contact the visitor if information is needed to prepare."}</p>}</RecordSection>
        <RecordSection title="Contact details"><RecordFields>
          <RecordField label="Phone number">{phoneHref ? <a href={phoneHref}><FiPhone aria-hidden="true" /><span className="min-w-0 wrap-anywhere">{visitor.phone}</span></a> : visitor.phone}</RecordField>
          <RecordField label="Email address">{visitor.email && <a href={"mailto:" + encodeURIComponent(visitor.email)}><FiMail aria-hidden="true" /><span className="min-w-0 wrap-anywhere">{visitor.email}</span></a>}</RecordField>
        </RecordFields>{!visitor.phone && !visitor.email && <p className="record-empty mt-4">No contact details were provided with this visit.</p>}</RecordSection>
      </div>
      <aside className="record-stack record-aside" aria-label="Visitor follow-up">
        <RecordSection title="Welcome & follow-up"><p className="record-empty">{state.canAcknowledge ? "After responding to this visitor, acknowledge the record to show that their welcome has been attended to." : visitor.status === "CONFIRMED" ? "This visitor has been acknowledged. This records the church’s response; it does not confirm that the visit took place." : visitor.status === "COMPLETED" ? "This visit is recorded as completed. No acknowledgement action is needed." : "The current status does not have an acknowledgement action."}</p></RecordSection>
        <RecordSection title="Record details"><RecordFields>
          <RecordField label="Received">{date(visitor.createdAt)}</RecordField>
          {visitor.updatedAt && <RecordField label="Last updated">{date(visitor.updatedAt)}</RecordField>}
          <RecordField label="Visitor ID">{visitor.id}</RecordField>
        </RecordFields><RecordHistoryLink entity="Visitor" id={visitor.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
