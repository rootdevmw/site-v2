"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useUser,
  useAssignRole,
  useLinkUserToMember,
  useUnlinkUserFromMember,
} from "@/app/modules/users/hooks/useUserActions";
import { useRoles } from "@/app/modules/roles/hooks/useRoles";
import { useMembers } from "@/app/modules/members/hooks/useMembers";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useState } from "react";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: userData, isLoading: userLoading } = useUser(userId);
  const { data: rolesData } = useRoles({ limit: 100 });

  //  fetch members
  const { data: membersData } = useMembers({ page: 1, limit: 100 });

  const { mutate: assignRole, isPending } = useAssignRole();
  const { mutate: linkMember, isPending: isLinking } = useLinkUserToMember();
  const { mutate: unlinkMember, isPending: isUnlinking } =
    useUnlinkUserFromMember();

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | undefined>();

  const user = userData?.data;
  const roles = rolesData?.data || [];
  const members = membersData?.data || [];
  if (userLoading) {
    return <SpiritualLoader message="Loading user details..." />;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const availableRoles = roles.filter((r) => !user.roles.includes(r.name));

  //  map members → searchable select options
  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `${m.firstName} ${m.lastName}`,
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            {user.email}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">User Details</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/dashboard/users/${userId}/edit`)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--card-elevated)] text-[var(--text-primary)] hover:bg-[var(--card-bg)]"
          >
            Edit User
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--text-secondary)] text-[var(--text-primary)]"
          >
            Back
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">
          User Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              Email
            </label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {user.email}
            </p>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              Member
            </label>
            <p className="text-sm mt-1">
              {user.member ? (
                <span
                  onClick={() =>
                    router.push(`/dashboard/members/${user.member!.id}`)
                  }
                  className="text-[var(--main-gold)] cursor-pointer hover:underline transition"
                >
                  {user.member.firstName} {user.member.lastName}
                </span>
              ) : (
                <span className="text-[var(--text-secondary)]">Not linked</span>
              )}
            </p>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              Roles
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-1 rounded-md text-xs bg-[var(--main-gold)] text-black"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--text-secondary)]">
                  No roles assigned
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)]">
              Created
            </label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/*  MEMBER LINKING */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">
          Member Linking
        </h2>

        {!user.member ? (
          <div className="space-y-4">
            <SearchableSelect
              label="Select Member"
              options={memberOptions}
              value={selectedMember}
              onChange={(val) => setSelectedMember(val)}
              placeholder="Search member..."
            />

            <button
              onClick={() => {
                if (selectedMember) {
                  linkMember(
                    { userId, memberId: selectedMember },
                    {
                      onSuccess: () => setSelectedMember(undefined),
                    },
                  );
                }
              }}
              disabled={!selectedMember || isLinking}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black disabled:opacity-60"
            >
              {isLinking ? "Linking..." : "Link Member"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              Linked to{" "}
              <span className="text-[var(--text-primary)] font-medium">
                {user.member.firstName} {user.member.lastName}
              </span>
            </p>

            <button
              onClick={() => unlinkMember({ userId })}
              disabled={isUnlinking}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-60"
            >
              {isUnlinking ? "Unlinking..." : "Unlink"}
            </button>
          </div>
        )}
      </div>

      {/* Assign Role */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">
          Assign Role
        </h2>

        <div className="flex gap-4">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--card-elevated)] border border-[var(--border-soft)]"
          >
            <option value="">Select a role</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (selectedRole) {
                assignRole(
                  { userId, roleId: selectedRole },
                  {
                    onSuccess: () => setSelectedRole(""),
                  },
                );
              }
            }}
            disabled={!selectedRole || isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black disabled:opacity-60"
          >
            {isPending ? "Assigning..." : "Assign Role"}
          </button>
        </div>
      </div>
    </div>
  );
}
