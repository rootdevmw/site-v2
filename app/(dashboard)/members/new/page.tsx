import { MemberForm } from "@/app/modules/members/components/MemberForm";

export default function CreateMemberPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Add Member</h1>
        <p className="text-sm text-[var(--text-secondary)]">Register a new church member</p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <MemberForm />
      </div>
    </div>
  );
}
