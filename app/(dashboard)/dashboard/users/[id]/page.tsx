"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import {
  useUser,
  useLinkUserToMember,
  useUnlinkUserFromMember,
} from "@/app/modules/users/hooks/useUserActions";
import {
  useSetRole,
  useRemoveRole,
} from "@/app/modules/roles/hooks/useRoleActions";
import { useRequestPasswordReset } from "@/app/modules/auth/hooks/useRequestPasswordReset";

import { useRoles } from "@/app/modules/roles/hooks/useRoles";
import { useMembers } from "@/app/modules/members/hooks/useMembers";

import { SpiritualLoader } from "@/components/ui/SpiritualLoader";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { showError, showSuccess } from "@/lib/toast";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: userData, isLoading: userLoading } = useUser(userId);
  const { data: rolesData } = useRoles({ limit: 100 });
  const { data: membersData } = useMembers({ page: 1, limit: 100 });

  const { mutate: setRole, isPending: isSettingRole } = useSetRole();
  const { mutate: removeRole, isPending: isRemovingRole } = useRemoveRole();

  const { mutate: linkMember, isPending: isLinking } = useLinkUserToMember();
  const { mutate: unlinkMember, isPending: isUnlinking } =
    useUnlinkUserFromMember();

  const { mutate: resendSetPassword, isPending: isResendingPassword } =
    useRequestPasswordReset();

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

  const currentRole = user.roles?.[0] || null;

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `${m.firstName} ${m.lastName}`,
  }));

  function handleResendPassword() {
    resendSetPassword(
      { email: user!.email },
      {
        onSuccess: () => showSuccess("Reset password link sent"),
        onError: () => showError("Failed to send reset password link"),
      },
    );
  }

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
            onClick={handleResendPassword}
            disabled={isResendingPassword}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-60"
          >
            {isResendingPassword ? "Sending..." : "Resend Set Password Link"}
          </button>

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

      {/* USER INFO */}
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
              Current Role
            </label>
            <div className="mt-1">
              {currentRole ? (
                <span className="px-3 py-1 rounded-md text-xs bg-[var(--main-gold)] text-black">
                  {currentRole}
                </span>
              ) : (
                <span className="text-sm text-[var(--text-secondary)]">
                  No role assigned
                </span>
              )}
            </div>
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
                  className="text-[var(--main-gold)] cursor-pointer hover:underline"
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
              Created
            </label>
            <p className="text-sm text-[var(--text-primary)] mt-1">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* ROLE MANAGEMENT */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">
          Role Management
        </h2>

        {/* SET / CHANGE ROLE */}
        <div className="space-y-3">
          <label className="text-xs text-[var(--text-secondary)]">
            Set / Change Role
          </label>

          <div className="flex gap-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--card-elevated)] border border-[var(--border-soft)]"
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                if (!selectedRole) return;

                setRole(
                  { userId, roleId: selectedRole },
                  {
                    onSuccess: () => {
                      showSuccess("Role updated");
                      setSelectedRole("");
                    },
                    onError: () => showError("Failed to update role"),
                  },
                );
              }}
              disabled={!selectedRole || isSettingRole}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black disabled:opacity-60"
            >
              {isSettingRole
                ? "Saving..."
                : currentRole
                  ? "Change Role"
                  : "Set Role"}
            </button>
          </div>
        </div>

        {/* REMOVE ROLE */}
        {currentRole && (
          <div className="pt-2 border-t border-[var(--border-soft)]">
            <button
              onClick={() =>
                removeRole(
                  { userId },
                  {
                    onSuccess: () => showSuccess("Role removed"),
                    onError: () => showError("Failed to remove role"),
                  },
                )
              }
              disabled={isRemovingRole}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-60"
            >
              {isRemovingRole ? "Removing..." : "Remove Role"}
            </button>
          </div>
        )}
      </div>

      {/* MEMBER LINKING (unchanged) */}
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
    </div>
  );
}
