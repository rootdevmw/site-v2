import Link from "next/link";
import { FiEdit2, FiPhone } from "react-icons/fi";
import type { MemberDetails } from "@/app/modules/members/utils/member-details";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getPhoneHref, readableRecordLabel } from "@/lib/utils/record-details";
import { RecordAvatar } from "./RecordAvatar";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordRelatedList, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordRichText } from "./RecordRichText";
import { RecordHistoryLink } from "./RecordHistoryLink";

export function MemberRecordView({ member }: { member: MemberDetails }) {
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ").trim() || "Unnamed member";
  const initials = [member.firstName, member.lastName].map((part) => part?.trim().charAt(0)).filter(Boolean).join("").toUpperCase();
  const phoneHref = getPhoneHref(member.phone);
  return <RecordPage>
    <RecordHeader
      backHref="/dashboard/members" backLabel="Back to members" eyebrow="Member profile" title={name}
      description={[member.prefix && readableRecordLabel(member.prefix), member.location].filter(Boolean).join(" · ")}
      identity={<RecordAvatar name={name} initials={initials} imageUrl={member.imageUrl} />}
      badges={<RecordStatus tone={member.status === "MEMBER" ? "positive" : "info"}>{readableRecordLabel(member.status)}</RecordStatus>}
      actions={<Link href={"/dashboard/members/" + encodeURIComponent(member.id) + "/edit"} className="record-button record-button-primary"><FiEdit2 aria-hidden="true" />Edit profile</Link>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="Contact & location" description="Details recorded in the church directory.">
          <RecordFields>
            <RecordField label="Phone number">{phoneHref ? <a href={phoneHref}><FiPhone aria-hidden="true" /><span className="min-w-0 wrap-anywhere">{member.phone}</span></a> : member.phone}</RecordField>
            <RecordField label="Location">{member.location}</RecordField>
          </RecordFields>
        </RecordSection>
        <RecordSection title="Church life">
          <RecordFields>
            <RecordField label="Church title">{readableRecordLabel(member.prefix)}</RecordField>
            <RecordField label="Baptism recorded">{member.isBaptized === undefined ? "Not recorded" : member.isBaptized ? "Yes" : "No"}</RecordField>
            {member.baptismDate && <RecordField label="Baptism date">{formatChurchDate(member.baptismDate, { day: "numeric", month: "long", year: "numeric" })}</RecordField>}
            <RecordField label="Added to directory" fallback="Creation date not recorded">{member.createdAt && formatChurchDate(member.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField>
          </RecordFields>
        </RecordSection>
        <RecordSection title="Biography">
          <RecordRichText content={member.bio} emptyMessage="No biography has been added. Use Edit profile to add a little about this person." />
        </RecordSection>
      </div>
      <aside className="record-stack record-aside" aria-label="Church connections">
        <RecordSection title="Homecell" description="A smaller community for fellowship and prayer.">
          <RecordRelatedList records={member.homecell ? [member.homecell] : []} baseHref="/dashboard/homecells" emptyMessage="No homecell is assigned to this profile." />
          {member.homecell?.location && <p className="record-empty mt-2 wrap-anywhere">{member.homecell.location}</p>}
        </RecordSection>
        <RecordSection title="Ministries" aside={<span>{member.ministries.length} assigned</span>}>
          <RecordRelatedList records={member.ministries} baseHref="/dashboard/ministries" emptyMessage="No ministry assignments are recorded. Update the profile to add an assignment." />
        </RecordSection>
        <RecordSection title="Directory reference"><RecordFields><RecordField label="Member ID">{member.id}</RecordField></RecordFields><RecordHistoryLink entity="Member" id={member.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
