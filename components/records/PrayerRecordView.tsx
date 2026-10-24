import type { ReactNode } from "react";
import { FiMail, FiPhone } from "react-icons/fi";
import type { Prayer } from "@/app/modules/attention/types/attention.types";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getPhoneHref, getPrayerState, readableRecordLabel } from "@/lib/utils/record-details";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordHistoryLink } from "./RecordHistoryLink";

export function PrayerRecordView({ prayer, followUpAction, feedback }: { prayer: Prayer; followUpAction: ReactNode; feedback?: ReactNode }) {
  const state = getPrayerState(prayer.status);
  const phoneHref = getPhoneHref(prayer.phone);
  const date = (value: string) => formatChurchDate(value, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
  return <RecordPage>
    <RecordHeader backHref="/dashboard/attention/prayers" backLabel="Back to prayer requests" eyebrow="Prayer request" title={prayer.name?.trim() || "Anonymous request"}
      description={"Received " + date(prayer.createdAt) + " · Malawi time"}
      badges={<><RecordStatus tone={state.tone}>{state.label}</RecordStatus>{prayer.isUrgent && <RecordStatus tone="danger">Urgent</RecordStatus>}</>}
      actions={followUpAction}
    />
    {feedback && <div className="mt-5">{feedback}</div>}
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="The prayer request" description={"Prayer for: " + readableRecordLabel(prayer.prayerFor, "Not specified")}>
          <p className="whitespace-pre-wrap text-base leading-8 wrap-anywhere">{prayer.request || "No request details were provided."}</p>
        </RecordSection>
        <RecordSection title="Contact details" description="Use the contact information provided with this request.">
          <RecordFields>
            <RecordField label="Phone number">{phoneHref ? <a href={phoneHref}><FiPhone aria-hidden="true" /><span className="min-w-0 wrap-anywhere">{prayer.phone}</span></a> : prayer.phone}</RecordField>
            <RecordField label="Email address">{prayer.email && <a href={"mailto:" + encodeURIComponent(prayer.email)}><FiMail aria-hidden="true" /><span className="min-w-0 wrap-anywhere">{prayer.email}</span></a>}</RecordField>
          </RecordFields>
          {!prayer.phone && !prayer.email && <p className="record-empty mt-5 border-t border-[#e7e0d5] pt-4">No contact information was shared with this request.</p>}
        </RecordSection>
      </div>
      <aside className="record-stack record-aside" aria-label="Prayer follow-up and preferences">
        <RecordSection title="Prayer follow-up">
          <p className="record-empty">{state.canMarkPrayed ? "After praying for this request, use Mark as prayed to record that it has been attended to." : prayer.status === "PRAYED_FOR" ? "This request has been marked as prayed. No further completion action is needed." : "The current status does not have a completion action."}</p>
          {prayer.updatedAt && <p className="mt-5 border-t border-[#e7e0d5] pt-4 text-xs leading-6 text-[#6c6257]">Last updated {date(prayer.updatedAt)}</p>}
        </RecordSection>
        <RecordSection title="Request preferences">
          <RecordFields>
            <RecordField label="Urgent request">{prayer.isUrgent ? "Yes" : "No"}</RecordField>
            <RecordField label="Share with elders">{prayer.shareWithElders ? "Yes" : "No"}</RecordField>
            {prayer.requestType && <RecordField label="Request type">{readableRecordLabel(prayer.requestType)}</RecordField>}
          </RecordFields>
        </RecordSection>
        <RecordSection title="Record details"><RecordFields><RecordField label="Request ID">{prayer.id}</RecordField></RecordFields><RecordHistoryLink entity="PrayerRequest" id={prayer.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
