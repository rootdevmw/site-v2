import Link from "next/link";
import type { ReactNode } from "react";
import type { User } from "@/app/modules/users/types/user.types";
import { formatChurchDate } from "@/lib/utils/church-date";
import { getAccountRoles, getRoleContext } from "@/lib/utils/account-records";
import { RecordAvatar } from "./RecordAvatar";
import { RecordField, RecordFields, RecordHeader, RecordPage, RecordSection, RecordStatus } from "./RecordLayout";
import { RecordHistoryLink } from "./RecordHistoryLink";

export function UserRecordView({ user, currentAccount = false, rolesPanel, memberPanel, passwordAction }: { user: User; currentAccount?: boolean; rolesPanel: ReactNode; memberPanel: ReactNode; passwordAction: ReactNode }) {
  const roles = getAccountRoles(user.roles);
  const context = getRoleContext(roles);
  const name = [user.member?.firstName, user.member?.lastName].filter(Boolean).join(" ");
  const initials = name ? [user.member?.firstName?.[0], user.member?.lastName?.[0]].join("") : user.email.slice(0, 2).toUpperCase();
  return <RecordPage>
    <RecordHeader backHref="/dashboard/users" backLabel="Back to users" eyebrow="Website account" title={user.email}
      description={name ? "Account linked to " + name : "No directory profile is linked to this account."}
      identity={<RecordAvatar name={name || user.email} initials={initials} />}
      badges={<>{currentAccount && <RecordStatus tone="info">Your account</RecordStatus>}{roles.length ? roles.map((role) => <RecordStatus key={role}>{role}</RecordStatus>) : <RecordStatus tone="warning">No role recorded</RecordStatus>}</>}
      actions={<Link href={"/dashboard/users/" + encodeURIComponent(user.id) + "/edit"} className="record-button record-button-primary">Edit account</Link>}
    />
    <div className="record-columns mt-6">
      <div className="record-stack">
        <RecordSection title="Account roles" description="Roles determine which dashboard areas this account can access.">
          <RecordFields><RecordField label="Recorded roles">{roles.length ? roles.join(", ") : "No role recorded"}</RecordField><RecordField label="Highest configured role">{context.highest || "No recognized role"}</RecordField></RecordFields>
          {roles.length > 1 && <p className="record-empty mt-4">More than one role is recorded. Review role history after changing an assignment.</p>}
          <div className="mt-5 border-t border-[#e7e0d5] pt-5">{rolesPanel}</div>
          <Link href={"/dashboard/audit/UserRole/" + encodeURIComponent(user.id)} className="record-back !mb-0 mt-4">View role assignment history</Link>
        </RecordSection>
        <RecordSection title="Directory profile" description="The account and directory profile are separate records.">{memberPanel}</RecordSection>
      </div>
      <aside className="record-stack record-aside" aria-label="Account information and recovery">
        <RecordSection title="Account information"><RecordFields><RecordField label="Email address"><a href={"mailto:" + encodeURIComponent(user.email)}>{user.email}</a></RecordField><RecordField label="Created">{formatChurchDate(user.createdAt, { day: "numeric", month: "long", year: "numeric" })}</RecordField><RecordField label="Linked profile">{user.member ? <Link href={"/dashboard/members/" + encodeURIComponent(user.member.id)}>{name || "Open directory profile"}</Link> : "Not linked"}</RecordField></RecordFields></RecordSection>
        <RecordSection title="Password assistance"><p className="record-empty mb-4">Request a password reset email for the account holder. They choose their own password using the link.</p>{passwordAction}</RecordSection>
        <RecordSection title="Record details"><RecordFields><RecordField label="User ID">{user.id}</RecordField></RecordFields><RecordHistoryLink entity="User" id={user.id} /></RecordSection>
      </aside>
    </div>
  </RecordPage>;
}
