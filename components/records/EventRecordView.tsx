import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowUpRight, FiCalendar, FiEdit2, FiMapPin } from "react-icons/fi";
import type { Event } from "@/app/modules/events/types/event.types";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getEventPhase } from "@/lib/utils/record-details";
import { RecordActionsMenu } from "./RecordActionsMenu";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordRelatedList, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordRichText } from "./RecordRichText";
import { RecordHistoryLink } from "./RecordHistoryLink";

export function EventRecordView({ event, now, deleteAction }: { event: Event; now: number; deleteAction?: ReactNode }) {
  const phase = getEventPhase(event.startTime, event.endTime, now);
  const hasDate = Number.isFinite(new Date(event.startTime).getTime());
  const fullDate = (value: string) => formatChurchDate(value, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
  return <RecordPage>
    <RecordHeader backHref="/dashboard/events" backLabel="Back to events" eyebrow="Church gathering" title={event.title}
      description={<span className="inline-flex items-start gap-2"><FiMapPin aria-hidden="true" className="mt-1 shrink-0" /><span>{event.location || "Location to be confirmed"}</span></span>}
      identity={<div className="flex size-24 flex-col items-center justify-center rounded-2xl border border-[#e3d4bc] bg-[#f3e8d6] text-[#743c21]" aria-label={hasDate ? formatChurchDate(event.startTime, { day: "numeric", month: "long", year: "numeric" }) : "Date to confirm"}>{hasDate ? <><span className="text-xs font-bold uppercase tracking-widest">{formatChurchDate(event.startTime, { month: "short" })}</span><span className="mt-1 text-4xl font-semibold leading-none tracking-tight">{formatChurchDate(event.startTime, { day: "numeric" })}</span><span className="mt-1 text-xs">{formatChurchDate(event.startTime, { year: "numeric" })}</span></> : <FiCalendar aria-hidden="true" className="size-8" />}</div>}
      badges={<><RecordStatus tone={phase.tone}>{phase.label}</RecordStatus>{event.type?.name && <RecordStatus>{event.type.name}</RecordStatus>}</>}
      actions={<Link href={"/dashboard/events/" + encodeURIComponent(event.id) + "/edit"} className="record-button record-button-primary"><FiEdit2 aria-hidden="true" />Edit event</Link>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="Schedule & location" description="All times are local to Malawi (CAT).">
          <RecordFields>
            <RecordField label="Starts">{fullDate(event.startTime)}</RecordField>
            <RecordField label="Ends">{fullDate(event.endTime)}</RecordField>
            <RecordField label="Location" fallback="Location to be confirmed">{event.location}</RecordField>
          </RecordFields>
        </RecordSection>
        <RecordSection title="About this gathering"><RecordRichText content={event.description} emptyMessage="No event description has been added. Edit the event to share the details of this gathering." /></RecordSection>
      </div>
      <aside className="record-stack record-aside" aria-label="Event management and connections">
        <RecordSection title="Event management">
          <p className="record-empty">Review the event as visitors see it on the church website.</p>
          {event.slug ? <Link href={"/events/" + encodeURIComponent(event.slug)} target="_blank" rel="noopener noreferrer" className="record-button record-button-secondary mt-4 w-full">View public page <FiArrowUpRight aria-hidden="true" /></Link> : <p className="record-empty mt-3">A public page link is not available for this event.</p>}
          {deleteAction && <RecordActionsMenu>{deleteAction}</RecordActionsMenu>}
        </RecordSection>
        <RecordSection title="Related ministries" aside={<span>{event.ministries?.length ?? 0} linked</span>}>
          <RecordRelatedList records={event.ministries ?? []} baseHref="/dashboard/ministries" emptyMessage="No ministries are linked to this gathering." />
        </RecordSection>
        <RecordSection title="Record details"><RecordFields>
          <RecordField label="Added to the calendar" fallback="Creation date not recorded">{event.createdAt && formatChurchDate(event.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField>
          <RecordField label="Event ID">{event.id}</RecordField>
        </RecordFields><RecordHistoryLink entity="Event" id={event.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
