import { UserForm } from "@/app/modules/users/components/UserForm";

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Add User
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Create a new user account
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <UserForm mode="create" initialData={{}} />
      </div>
    </div>
  );
}
