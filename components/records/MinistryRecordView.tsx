import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowUpRight, FiEdit2, FiUsers } from "react-icons/fi";
import type { MinistryDetails } from "@/app/modules/ministries/utils/ministry-details";
import { formatChurchDate } from "@/lib/utils/church-date";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordLeadership } from "./RecordLeadership";
import { RecordHistoryLink } from "./RecordHistoryLink";
import { RecordRichText } from "./RecordRichText";

export function MinistryRecordView({ ministry, membership }: { ministry: MinistryDetails; membership: ReactNode }) {
  return <RecordPage>
    <RecordHeader backHref="/dashboard/ministries" backLabel="Back to ministries" eyebrow="Ministry profile" title={ministry.name}
      description="People, purpose, and service in the church community."
      identity={<div className="flex size-24 items-center justify-center rounded-2xl border border-[var(--brand-line)] bg-[var(--brand-soft)] text-[var(--brand-link)]"><FiUsers aria-hidden="true" className="size-9" /></div>}
      badges={<RecordStatus>{ministry.members.length} {ministry.members.length === 1 ? "member" : "members"} assigned</RecordStatus>}
      actions={<Link href={"/dashboard/ministries/" + encodeURIComponent(ministry.id) + "/edit"} className="record-button record-button-primary"><FiEdit2 aria-hidden="true" />Edit ministry</Link>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="Purpose & service">
          <p className="whitespace-pre-wrap text-base leading-8 wrap-anywhere">{ministry.purpose || "A ministry purpose has not been recorded."}</p>
          {ministry.description && <div className="mt-5 border-t border-[#e7e0d5] pt-5"><RecordRichText content={ministry.description} emptyMessage="No further description has been added." /></div>}
        </RecordSection>
        <RecordSection title="Leadership" description="Open a profile for more about the people leading this ministry."><RecordLeadership leader={ministry.leader} overseer={ministry.overseer} /></RecordSection>
        {membership}
      </div>
      <aside className="record-stack record-aside" aria-label="Ministry gatherings and context">
        <RecordSection title="Upcoming gatherings" description="Linked events, in Malawi time (CAT).">
          {ministry.events?.length ? <ul className="record-related">{ministry.events.map((event) => <li key={event.id}><Link href={"/dashboard/events/" + encodeURIComponent(event.id)}><span className="min-w-0"><span className="block wrap-anywhere">{event.title}</span><span className="mt-1 block text-xs font-normal leading-6 text-[#6c6257]">{formatChurchDate(event.startTime, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span></span><FiArrowUpRight aria-hidden="true" className="size-4 shrink-0" /></Link></li>)}</ul> : <p className="record-empty">No upcoming gatherings are linked to this ministry.</p>}
        </RecordSection>
        <RecordSection title="Public ministry page">
          <p className="record-empty">See how this ministry is introduced to visitors.</p>
          {ministry.slug ? <Link href={"/ministries/" + encodeURIComponent(ministry.slug)} target="_blank" rel="noopener noreferrer" className="record-button record-button-secondary mt-4 w-full">View public page<FiArrowUpRight aria-hidden="true" /></Link> : <p className="record-empty mt-3">A public page link is not available.</p>}
        </RecordSection>
        <RecordSection title="Record details"><RecordFields>
          <RecordField label="Ministry ID">{ministry.id}</RecordField>
          <RecordField label="Created" fallback="Creation date not recorded">{ministry.createdAt && formatChurchDate(ministry.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField>
        </RecordFields><RecordHistoryLink entity="Ministry" id={ministry.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
