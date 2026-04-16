import { HomecellForm } from "@/app/modules/homecells/components/HomecellForm";

export default function CreateHomecellPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Add Homecell
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create a new homecell
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6">
        <HomecellForm mode="create" initialData={{}} />
      </div>
    </div>
  );
}
