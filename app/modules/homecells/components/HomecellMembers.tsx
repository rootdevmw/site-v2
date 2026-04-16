"use client";

import { useState } from "react";
import { useMembers } from "@/app/modules/members/hooks/useMembers";

import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

import { useAssignMember } from "../hooks/useAssignMember";
import { useRemoveMember } from "../hooks/useRemoveMember";

export function HomecellMembers({
  homecellId,
  members,
}: {
  homecellId: string;
  members: any[];
}) {
  const [selected, setSelected] = useState("");

  const { data } = useMembers({ page: 1, limit: 100 });

  const allMembers = data?.data || [];

  const assignedIds = new Set(members.map((m) => m.id));

  const options = allMembers
    .filter((m: any) => !assignedIds.has(m.id))
    .map((m: any) => ({
      label: `${m.firstName} ${m.lastName}`,
      value: m.id,
    }));

  const assignMutation = useAssignMember(homecellId);
  const removeMutation = useRemoveMember(homecellId);

  return (
    <div className="space-y-6">
      {/* Assign */}
      <div className="max-w-md">
        <SearchableSelect
          label="Add Member"
          options={options}
          value={selected}
          onChange={(val) => {
            setSelected(val);
            assignMutation.mutate(val);
          }}
        />
      </div>

      {/* Members List */}
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-soft)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-[var(--text-secondary)] bg-[var(--card-elevated)]">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m: any) => (
              <tr
                key={m.id}
                className="hover:bg-[var(--hover-soft)] transition"
              >
                <td className="px-4 py-3">
                  {m.firstName} {m.lastName}
                </td>

                <td className="px-4 py-3 text-right">
                  <span onClick={(e) => e.stopPropagation()}>
                    <DeleteConfirmButton
                      triggerLabel="Remove"
                      confirmLabel="Remove"
                      description={`Remove ${m.firstName} ${m.lastName} from homecell?`}
                      onConfirm={() => removeMutation.mutate(m.id)}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
