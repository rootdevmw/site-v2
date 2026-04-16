"use client";

import { useParams } from "next/navigation";
import { useMinistry } from "@/app/modules/ministries/hooks/useMinistry";
import { useMinistryMembers } from "@/app/modules/ministries/hooks/useMinistryMember";
import { useMembers } from "@/app/modules/members/hooks/useMembers";
import { useAssignMember } from "@/app/modules/ministries/hooks/useAssignMember";
import { useRemoveMember } from "@/app/modules/ministries/hooks/useRemoveMember";

import { Info } from "@/components/ui/Info";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

import {
  MinistryMember,
  MinistryMemberPayload,
} from "@/app/modules/ministries/types/ministry.types";

export default function MinistryDetailsPage() {
  const { id } = useParams();
  const ministryId = id as string;

  const { data, isLoading } = useMinistry(ministryId);
  const { data: membersData, isLoading: loadingMembers } =
    useMinistryMembers(ministryId);

  const { data: allMembersData } = useMembers({
    page: 1,
    limit: 100,
  });

  const assign = useAssignMember();
  const remove = useRemoveMember();

  if (isLoading) {
    return <SpiritualLoader message="Loading ministry..." />;
  }

  const ministry = data?.data;

  if (!ministry) {
    return (
      <div className="text-sm text-[var(--text-secondary)]">
        Ministry not found
      </div>
    );
  }

  // ✅ Normalize relational response
  const raw = membersData?.data as MinistryMemberPayload;

  const members: MinistryMember[] = Array.isArray(raw)
    ? raw
        .map((m) => m.member ?? m)
        .filter((m): m is MinistryMember => !!m.id)
    : raw?.members || [];

  const allMembers = (allMembersData?.data || []) as MinistryMember[];

  // ✅ Prevent duplicates
  const assignedIds = new Set(members.map((m) => m.id));
  const availableMembers = allMembers.filter((m) => !assignedIds.has(m.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">{ministry.name}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {ministry.description}
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Info
          label="Leader"
          value={
            ministry.leader
              ? `${ministry.leader.firstName} ${ministry.leader.lastName}`
              : "-"
          }
        />

        <Info
          label="Overseer"
          value={
            ministry.overseer
              ? `${ministry.overseer.firstName} ${ministry.overseer.lastName}`
              : "-"
          }
        />

        <Info label="Total Members" value={String(members.length)} />
      </div>

      {/* Members Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-soft)]">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">
            Members
          </h2>

          <div className="w-64">
            <SearchableSelect
              label=""
              placeholder="Add member..."
              options={availableMembers.map((m) => ({
                label: `${m.firstName} ${m.lastName}`,
                value: m.id,
              }))}
              onChange={(memberId) => {
                assign.mutate({
                  ministryId,
                  memberId,
                });
              }}
            />
          </div>
        </div>

        {/* Body */}
        {loadingMembers ? (
          <div className="p-6">
            <SpiritualLoader />
          </div>
        ) : members.length === 0 ? (
          <div className="p-6 text-sm text-[var(--text-secondary)] text-center">
            No members assigned yet
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {members.map((m, index) => (
              <div
                key={m.id ?? index}
                className="flex items-center justify-between px-6 py-4 hover:bg-[var(--hover-soft)] transition"
              >
                {/* Member Info */}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {m.firstName} {m.lastName}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {m.status || "Assigned"}
                  </span>
                </div>

                {/* Action */}
                <DeleteConfirmButton
                  triggerLabel="Remove"
                  title="Remove member"
                  description={`Remove ${m.firstName} ${m.lastName} from this ministry?`}
                  confirmLabel="Remove"
                  onConfirm={() =>
                    remove.mutateAsync({
                      ministryId,
                      memberId: m.id,
                    })
                  }
                  className="px-3 py-1 text-xs rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-all duration-200"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
