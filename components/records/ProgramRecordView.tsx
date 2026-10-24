import Link from "next/link";
import { FiCalendar, FiEdit2, FiMapPin } from "react-icons/fi";
import type { Program } from "@/app/modules/programs/types/program.types";
import { ProgramDetails } from "@/app/modules/programs/components/ProgramDetails";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getProgramDateValue, getProgramDayState, getProgramSummary } from "@/lib/utils/program-records";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordHistoryLink } from "./RecordHistoryLink";

export function ProgramRecordView({ program, now = new Date() }: { program: Program; now?: Date }) {
  const state = getProgramDayState(program.date, now);
  const date = getProgramDateValue(program.date);
  const summary = getProgramSummary(program.items);
  const homecellId = program.homecell?.id || program.homecellId;
  const dateLabel = date ? formatChurchDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Date to be confirmed";
  return <RecordPage>
    <RecordHeader backHref="/dashboard/programs" backLabel="Back to programs" eyebrow="Order of service" title={program.type?.name || "Church program"}
      description={<><p>{dateLabel}</p><p className="mt-1 inline-flex items-start gap-2"><FiMapPin aria-hidden="true" className="mt-1 shrink-0" /><span>{program.location || "Location to be confirmed"}</span></p></>}
      identity={<div className="record-program-date" aria-label={dateLabel}>{date ? <><span>{formatChurchDate(date, { month: "short" })}</span><strong>{formatChurchDate(date, { day: "numeric" })}</strong><span>{formatChurchDate(date, { year: "numeric" })}</span></> : <FiCalendar aria-hidden="true" className="size-8" />}</div>}
      badges={<><RecordStatus tone={state.tone}>{state.label}</RecordStatus><RecordStatus>{homecellId ? "Homecell program" : "Church program"}</RecordStatus></>}
      actions={<Link href={"/dashboard/programs/" + encodeURIComponent(program.id) + "/edit"} className="record-button record-button-primary"><FiEdit2 aria-hidden="true" />Edit program</Link>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="Order of activities" description="Follow the planned sequence. Activity times are local to Malawi (CAT).">
          <ProgramSummary summary={summary} />
          <ProgramDetails program={program} />
        </RecordSection>
      </div>
      <aside className="record-stack record-aside" aria-label="Program schedule and connections">
        <RecordSection title="Gathering details"><RecordFields>
          <RecordField label="Program date">{dateLabel}</RecordField>
          <RecordField label="Location" fallback="Location to be confirmed">{program.location}</RecordField>
          <RecordField label="Program type">{program.type?.name}</RecordField>
          <RecordField label="Homecell">{homecellId ? <Link href={"/dashboard/homecells/" + encodeURIComponent(homecellId)}>{program.homecell?.name || "Assigned homecell"}</Link> : "Church-wide"}</RecordField>
        </RecordFields></RecordSection>
        <RecordSection title="Sharing"><p className="record-empty">Review this program on the public church website.</p>{program.slug ? <Link href={"/programs/" + encodeURIComponent(program.slug)} className="record-button record-button-secondary mt-4 w-full">View public program</Link> : <p className="record-empty mt-3">A public page link is not available yet.</p>}</RecordSection>
        <RecordSection title="Record details"><RecordFields><RecordField label="Created" fallback="Creation date not recorded">{program.createdAt && formatChurchDate(program.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField><RecordField label="Program ID">{program.id}</RecordField></RecordFields><RecordHistoryLink entity="Program" id={program.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}

export function ProgramSummary({ summary }: { summary: ReturnType<typeof getProgramSummary> }) {
  return <dl className="record-program-summary" aria-label="Activity planning summary">{[
    { label: "Activities", value: summary.total }, { label: "With a time", value: summary.timed }, { label: "Need a responsible person", value: summary.unassigned },
  ].map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>;
}
