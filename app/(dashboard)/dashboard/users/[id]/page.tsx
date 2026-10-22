"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/app/modules/users/hooks/useUserActions";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useAccountPasswordReset } from "@/lib/hooks/useAccountPasswordReset";
import { UserRecordView } from "@/components/records/UserRecordView";
import { UserRolesPanel } from "@/components/records/UserRolesPanel";
import { UserMemberPanel } from "@/components/records/UserMemberPanel";
import { RecordActionDialog } from "@/components/records/RecordActionDialog";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["ADMIN"]);
  const query = useUser(id, permitted);
  const reset = useAccountPasswordReset();
  if (!permitted) return <RecordFeedback kind="forbidden" entity="User" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading account…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="User" backHref="/dashboard/users" backLabel="Back to users" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="User" backHref="/dashboard/users" backLabel="Back to users" />;

  const user = query.data.data;
  return <UserRecordView key={user.id} user={user} currentAccount={actor?.id === user.id}
    rolesPanel={<UserRolesPanel user={user} canManage={hasRequiredRole(actor?.roles ?? [], ["ROOT"])} refreshing={query.isFetching} />}
    memberPanel={<UserMemberPanel user={user} refreshing={query.isFetching} />}
    passwordAction={<RecordActionDialog actionKey={user.id + ":" + user.email} label="Request password reset" title="Request a password reset email?" description={"Request a reset link for " + user.email + ". The account holder uses the email to choose a new password."} pendingLabel="Requesting reset…" successMessage="Password reset requested. Ask the account holder to check their inbox." errorMessage="Could not confirm the reset request. Check with the account holder before requesting another link." busy={reset.isPending || query.isFetching} secondary onConfirm={() => reset.mutateAsync(user.email)} />}
  />;
}
