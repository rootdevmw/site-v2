import { RoleForm } from "@/app/modules/roles/components/RoleForm";

export default function CreateRolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Add Role
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create a new user role
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <RoleForm mode="create" initialData={{}} />
      </div>
    </div>
  );
}
