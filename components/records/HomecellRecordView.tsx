import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowUpRight, FiEdit2, FiHome, FiMapPin } from "react-icons/fi";
import type { HomecellDetails } from "@/app/modules/homecells/utils/homecell-details";
import { formatChurchDate } from "@/lib/utils/church-date";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordLeadership } from "./RecordLeadership";
import { RecordHistoryLink } from "./RecordHistoryLink";

export function HomecellRecordView({ homecell, membership, programs }: { homecell: HomecellDetails; membership: ReactNode; programs: ReactNode }) {
  return <RecordPage>
    <RecordHeader backHref="/dashboard/homecells" backLabel="Back to homecells" eyebrow="Homecell · small group" title={homecell.name}
      description={<span className="inline-flex items-start gap-2"><FiMapPin aria-hidden="true" className="mt-1 shrink-0" /><span>{homecell.location || "Location not recorded"}</span></span>}
      identity={<div className="flex size-24 items-center justify-center rounded-2xl border border-[#e3d4bc] bg-[#f3e8d6] text-[#743c21]"><FiHome aria-hidden="true" className="size-9" /></div>}
      badges={<RecordStatus>{homecell.members.length} {homecell.members.length === 1 ? "person" : "people"} assigned</RecordStatus>}
      actions={<Link href={"/dashboard/homecells/" + encodeURIComponent(homecell.id) + "/edit"} className="record-button record-button-primary"><FiEdit2 aria-hidden="true" />Edit homecell</Link>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="Leadership" description="The people responsible for leading and overseeing this homecell."><RecordLeadership leader={homecell.leader} overseer={homecell.overseer} /></RecordSection>
        {membership}
        {programs}
      </div>
      <aside className="record-stack record-aside" aria-label="Homecell context">
        <RecordSection title="Gathering location"><RecordFields><RecordField label="Location">{homecell.location}</RecordField></RecordFields><p className="record-empty mt-4">Use the scheduled program for the details of a particular gathering.</p></RecordSection>
        <RecordSection title="Public homecell page"><p className="record-empty">Review the group information available on the church website.</p>{homecell.slug ? <Link href={"/homecells/" + encodeURIComponent(homecell.slug)} target="_blank" rel="noopener noreferrer" className="record-button record-button-secondary mt-4 w-full">View public page<FiArrowUpRight aria-hidden="true" /></Link> : <p className="record-empty mt-3">A public page link is not available.</p>}</RecordSection>
        <RecordSection title="Record details"><RecordFields>
          <RecordField label="Homecell ID">{homecell.id}</RecordField>
          <RecordField label="Created" fallback="Creation date not recorded">{homecell.createdAt && formatChurchDate(homecell.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField>
        </RecordFields><RecordHistoryLink entity="Homecell" id={homecell.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
