"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MemberForm } from "@/app/modules/members/components/MemberForm";
import { useMember } from "@/app/modules/members/hooks/useMember";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { useDeleteDirectoryRecord } from "@/lib/hooks/useDirectoryRecords";
import {
  RecordFeedback,
  RecordLoadError,
  RecordSkeleton,
} from "@/components/records/RecordLayout";
export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>();
  const actor = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(actor?.roles ?? [], ["DEACON"]);
  const query = useMember(id, permitted);
  const deletion = useDeleteDirectoryRecord("members");
  const router = useRouter();
  if (!permitted)
    return (
      <RecordFeedback
        kind="forbidden"
        entity="Member form"
        backHref="/dashboard"
        backLabel="Return to dashboard"
      />
    );
  if (query.isPending) return <RecordSkeleton label="Loading member editor…" />;
  if (query.isError && !query.data?.data)
    return (
      <RecordLoadError
        error={query.error}
        entity="Member"
        backHref="/dashboard/members"
        backLabel="Back to members"
        onRetry={() => {
          void query.refetch();
        }}
        retrying={query.isFetching}
      />
    );
  const member = query.data?.data;
  if (!member)
    return (
      <RecordFeedback
        kind="missing"
        entity="Member"
        backHref="/dashboard/members"
        backLabel="Back to members"
      />
    );
  return (
    <article
      className="record-page member-workspace"
      aria-labelledby="member-edit-title"
    >
      <Link
        href={"/dashboard/members/" + encodeURIComponent(id)}
        className="record-back"
      >
        Back to profile
      </Link>
      <header className="record-header">
        <div>
          <p className="record-eyebrow">Member profile · #{member.id}</p>
          <h1 id="member-edit-title" className="record-title">
            Edit {member.firstName} {member.lastName}
          </h1>
          <p className="record-description">
            Keep contact details, church connections and the member biography up
            to date.
          </p>
        </div>
      </header>
      {query.isError && (
        <p role="alert" className="member-form-summary">
          The latest profile could not be checked. Your current entries are
          kept; review the saved profile before retrying an uncertain change.
        </p>
      )}
      <div className="mt-6">
        <MemberForm
          key={id}
          mode="edit"
          initialConnections={{
            homecell: member.homecell,
            ministries: member.ministries,
          }}
          initialData={{
            id: member.id,
            prefix: member.prefix,
            firstName: member.firstName,
            lastName: member.lastName,
            phone: member.phone || "",
            status: member.status,
            location: member.location || "",
            homecellId: member.homecell?.id || "",
            ministryIds: member.ministries.map((entry) => entry.id),
            bio: member.bio || "",
            imageUrl: member.imageUrl || "",
            isBaptized: member.isBaptized ?? false,
            baptismDate: member.baptismDate || "",
          }}
          onDelete={async () => {
            await deletion.mutateAsync(id);
            router.push("/dashboard/members");
          }}
        />
      </div>
    </article>
  );
}
