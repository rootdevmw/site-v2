"use client";
import Link from "next/link";
import { useState } from "react";
import { MemberForm } from "@/app/modules/members/components/MemberForm";
import { CsvMemberImport } from "@/app/modules/members/components/CsvMemberImport";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { RecordFeedback } from "@/components/records/RecordLayout";
export default function CreateMemberPage() {
  const actor = useAuthStore((state) => state.user);
  const [method, setMethod] = useState("single");
  const [formBusy, setFormBusy] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  if (!hasRequiredRole(actor?.roles ?? [], ["DEACON"])) return <RecordFeedback kind="forbidden" entity="Member form" backHref="/dashboard" backLabel="Return to dashboard" />;
  return <article className="record-page member-workspace" aria-labelledby="member-create-title"><Link href="/dashboard/members" className="record-back">Back to members</Link><header className="record-header"><div><p className="record-eyebrow">Church directory</p><h1 className="record-title" id="member-create-title">Add a member</h1><p className="record-description">Welcome someone into the directory, record their church connections and build their profile over time.</p></div></header><div className="member-entry-method" role="group" aria-label="Member entry method">{[["single", "One person"], ["csv", "Import CSV"]].map(([value, label]) => <button key={value} type="button" className="record-button record-button-secondary" aria-pressed={method === value} aria-controls={"member-entry-" + value} disabled={formBusy || importBusy} onClick={() => setMethod(value)}>{label}</button>)}</div><div id="member-entry-single" hidden={method !== "single"}><MemberForm onBusyChange={setFormBusy} /></div><div id="member-entry-csv" hidden={method !== "csv"} className="record-section"><CsvMemberImport onBusyChange={setImportBusy} /></div></article>;
}
