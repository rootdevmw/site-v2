"use client";

import { useParams, useRouter } from "next/navigation";
import { useRole } from "@/app/modules/roles/hooks/useRoleActions";
import { useDeleteRole } from "@/app/modules/roles/hooks/useRoleActions";
import { RoleForm } from "@/app/modules/roles/components/RoleForm";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditRolePage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, isError } = useRole(id as string);
  const { mutateAsync: deleteRole } = useDeleteRole();

  if (isLoading) {
    return <SpiritualLoader message="Loading Role..." />;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load role
        <button
          onClick={() => router.push("/dashboard/roles")}
          className="ml-3 text-[var(--blue)] hover:opacity-90 transition-all duration-200"
        >
          Go back
        </button>
      </div>
    );
  }

  const role = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Edit Role
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Update role details
          </p>
        </div>

        <button
          onClick={() => router.push(`/dashboard/roles/${role.id}`)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          View Details
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <RoleForm
          mode="edit"
          initialData={{
            id: role.id,
            name: role.name,
          }}
          onDelete={async () => {
            await deleteRole(role.id);
            router.push("/dashboard/roles");
          }}
        />
      </div>
    </div>
  );
}
