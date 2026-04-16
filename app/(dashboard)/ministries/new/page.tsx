import { MinistryForm } from "@/app/modules/ministries/components/MinistryForm";

export default function CreateMinistryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Add Ministry</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create a new ministry
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <MinistryForm />
      </div>
    </div>
  );
}
