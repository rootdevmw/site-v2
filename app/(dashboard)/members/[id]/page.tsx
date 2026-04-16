"use client";

import { useParams } from "next/navigation";
import { useMember } from "@/app/modules/members/hooks/useMember";
import Link from "next/link";
import { Info } from "@/components/ui/Info";

type Ministry = {
  id: string;
  name: string;
};

export default function MemberDetailsPage() {
  const { id } = useParams();
  const { data, isLoading } = useMember(id as string);

  if (isLoading) return <div>Loading...</div>;

  const member = data?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">Member details</p>
        </div>

        <Link
          href={`/members/${member.id}/edit`}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          Edit
        </Link>
      </div>

      {/* Info Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl shadow-sm p-6 space-y-4">
        <Info label="Phone" value={member.phone} />
        <Info label="Status" value={member.status} />
        <Info label="Location" value={member.location} />
        <Info label="Homecell" value={member.homecell?.name} />

        {/* Ministries */}
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Ministries</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {member.ministries?.map((m: Ministry, index: number) => (
              <span
                key={m.id ?? index}
                className="px-2 py-1 text-xs bg-[var(--main-gold)] border border-[var(--gold-dark)] text-black rounded-full"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
