"use client";

import { useParams, useRouter } from "next/navigation";
import { useMember } from "@/app/modules/members/hooks/useMember";
import { MemberForm } from "@/app/modules/members/components/MemberForm";

type Ministry = {
  id: string;
};

export default function EditMemberPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, isError } = useMember(id as string);

  if (isLoading) {
    return <div className="p-6 text-sm text-[var(--text-secondary)]">Loading member...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load member
        <button
          onClick={() => router.push("/members")}
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
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Edit Member</h1>
          <p className="text-sm text-[var(--text-secondary)]">Update member details</p>
        </div>

        <button
          onClick={() => router.push(`/members/${member.id}`)}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200"
        >
          View Details
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6">
        <MemberForm
          id={member.id}
          initialData={{
            firstName: member.firstName,
            lastName: member.lastName,
            phone: member.phone,
            status: member.status,
            location: member.location,
            homecellId: member.homecell?.id || "",
            ministryIds: member.ministries?.map((m: Ministry) => m.id) || [],
          }}
        />
      </div>
    </div>
  );
}
