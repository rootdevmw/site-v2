"use client";

import { useParams, useRouter } from "next/navigation";
import { useMember } from "@/app/modules/members/hooks/useMember";
import { useDeleteMember } from "@/app/modules/members/hooks/useDeleteMember";
import { MemberForm } from "@/app/modules/members/components/MemberForm";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";

type Ministry = {
  id: string;
};

export default function EditMemberPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, isError } = useMember(id as string);
  const { mutateAsync: deleteMember } = useDeleteMember();

  if (isLoading) {
    return <SpiritualLoader message="Loading Member..." />;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load member
        <button
          onClick={() => router.push("/dashboard/members")}
          className="ml-3 text-[var(--blue)] hover:opacity-90 transition-all duration-200"
        >
          Go back
        </button>
      </div>
    );
  }

  const member = data.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Edit Member
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Update member details
          </p>
        </div>

        <button
          onClick={() => router.push(`/dashboard/members/${member.id}`)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          View Details
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <MemberForm
          mode="edit"
          initialData={{
            id: member.id,
            prefix: member.prefix,
            firstName: member.firstName,
            lastName: member.lastName,
            phone: member.phone,
            status: member.status,
            location: member.location,
            homecellId: member.homecell?.id || "",
            ministryIds: member.ministries?.map((m: Ministry) => m.id) || [],
            bio: member.bio || "",
          }}
          onDelete={async () => {
            await deleteMember(member.id);
            router.push("/dashboard/members");
          }}
        />
      </div>
    </div>
  );
}
