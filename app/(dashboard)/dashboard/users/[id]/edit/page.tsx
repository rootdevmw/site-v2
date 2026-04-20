"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/modules/users/hooks/useUserActions";
import { useDeleteUser } from "@/app/modules/users/hooks/useUserActions";
import { UserForm } from "@/app/modules/users/components/UserForm";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, isError } = useUser(id as string);
  const { mutateAsync: deleteUser } = useDeleteUser();

  if (isLoading) {
    return <SpiritualLoader message="Loading user details..." />;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load user
        <button
          onClick={() => router.push("/dashboard/users")}
          className="ml-3 text-[var(--blue)] hover:opacity-90 transition-all duration-200"
        >
          Go back
        </button>
      </div>
    );
  }

  const user = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Edit User
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Update user details
          </p>
        </div>

        <button
          onClick={() => router.push(`/dashboard/users/${user.id}`)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          View Details
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <UserForm
          mode="edit"
          initialData={{
            id: user.id,
            email: user.email,
          }}
          onDelete={async () => {
            await deleteUser(user.id);
            router.push("/dashboard/users");
          }}
        />
      </div>
    </div>
  );
}
