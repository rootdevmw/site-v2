"use client";

import { useParams } from "next/navigation";
import { useHomecell } from "@/app/modules/homecells/hooks/useHomecell";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { HomecellMembers } from "@/app/modules/homecells/components/HomecellMembers";
import { HomecellRecordView } from "@/components/records/HomecellRecordView";
import { HomecellProgramsPanel } from "@/components/records/HomecellProgramsPanel";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";

export default function HomecellDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useHomecell(id, permitted);

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Homecell" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading homecell…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Homecell" backHref="/dashboard/homecells" backLabel="Back to homecells" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data?.data) return <RecordFeedback kind="missing" entity="Homecell" backHref="/dashboard/homecells" backLabel="Back to homecells" />;

  const homecell = query.data.data;
  return <HomecellRecordView homecell={homecell}
    membership={<HomecellMembers key={homecell.id} homecellId={homecell.id} groupName={homecell.name} members={homecell.members} refreshing={query.isFetching} />}
    programs={<HomecellProgramsPanel key={homecell.id} homecellId={homecell.id} />}
  />;
}
