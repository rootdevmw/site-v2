import Link from "next/link";
import { FiShield } from "react-icons/fi";
import type { Role } from "@/app/modules/roles/types/role.types";
import { ROLE_HIERARCHY } from "@/lib/auth/roles";
import { getRoleContext } from "@/lib/utils/account-records";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordHistoryLink } from "./RecordHistoryLink";

export function RoleRecordView({ role }: { role: Role }) {
  const context = getRoleContext([role.name]);
  return <RecordPage>
    <RecordHeader backHref="/dashboard/roles" backLabel="Back to roles" eyebrow="Account role" title={role.name}
      description="Review how this role fits the configured dashboard hierarchy."
      identity={<div className="record-account-icon"><FiShield aria-hidden="true" /></div>}
      badges={<RecordStatus tone={context.highest ? "info" : "warning"}>{context.highest ? "Configured role" : "Outside configured hierarchy"}</RecordStatus>}
      actions={<Link href={"/dashboard/roles/" + encodeURIComponent(role.id) + "/edit"} className="record-button record-button-primary">Edit role</Link>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack"><RecordSection title="Dashboard navigation" description="These areas meet this role’s navigation requirements. Individual actions also depend on server permission checks.">
        {context.highest ? <ul className="record-related">{context.areas.map((area) => <li key={area.href}><Link href={area.href}>{area.label}</Link></li>)}</ul> : <p className="record-empty">This role name is not part of the configured hierarchy. A navigation access summary is unavailable.</p>}
      </RecordSection></div>
      <aside className="record-stack record-aside" aria-label="Role hierarchy and record details">
        <RecordSection title="Role hierarchy" description="Higher positions meet the navigation requirements of lower positions."><ol className="record-role-hierarchy">{ROLE_HIERARCHY.map((name, index) => <li key={name} aria-current={context.highest === name ? "true" : undefined}><span>{index + 1}</span><strong>{name}</strong>{context.highest === name && <span className="ml-auto">This role</span>}</li>)}</ol></RecordSection>
        <RecordSection title="Record details"><RecordFields><RecordField label="Role name">{role.name}</RecordField><RecordField label="Hierarchy position">{context.rank ? context.rank + " of " + context.levels : "Not configured"}</RecordField><RecordField label="Role ID">{role.id}</RecordField></RecordFields><RecordHistoryLink entity="Role" id={role.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
