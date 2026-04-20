"use client";

import { useParams, useRouter } from "next/navigation";
import { useRole } from "@/app/modules/roles/hooks/useRoleActions";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;

  const { data: roleData, isLoading } = useRole(roleId);

  const role = roleData?.data;

  if (isLoading) {
    return <SpiritualLoader message="Loading role details..." />;
  }

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {role.name}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Role Details</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/roles/${roleId}/edit`)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--card-elevated)] text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-all duration-200"
          >
            Edit Role
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--text-secondary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] transition-all duration-200"
          >
            Back
          </button>
        </div>
      </div>

      {/* Role Info */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">
          Role Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-[var(--text-secondary)]">Name</label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {role.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
