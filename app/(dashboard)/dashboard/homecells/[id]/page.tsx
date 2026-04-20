"use client";

import { useParams, useRouter } from "next/navigation";

import { useHomecell } from "@/app/modules/homecells/hooks/useHomecell";
import { useHomecellMembers } from "@/app/modules/homecells/hooks/useHomecellMembers";
import { usePrograms } from "@/app/modules/programs/hooks/usePrograms";

import { Info } from "@/components/ui/Info";
import { SpiritualLoader } from "@/components/ui/SpiritualLoader";
import { Table } from "@/components/ui/Table";

import { HomecellMembers } from "@/app/modules/homecells/components/HomecellMembers";
import { ProgramForm } from "@/app/modules/programs/components/ProgramForm";

export default function HomecellDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading } = useHomecell(id as string);
  const { data: membersData } = useHomecellMembers(id as string);

  const { data: programsData, isLoading: programsLoading } = usePrograms({
    page: 1,
    limit: 10,
    homecellId: id as string,
  });

  const homecell = data?.data;
  const members = membersData?.data || [];
  const programs = programsData?.data || [];

  if (isLoading || !homecell) {
    return <SpiritualLoader message="Loading homecell..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          {homecell.name}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Homecell details and members
        </p>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-4">
        <Info label="Location" value={homecell.location} />
        <Info
          label="Leader"
          value={
            homecell.leader
              ? `${homecell.leader.firstName} ${homecell.leader.lastName}`
              : "-"
          }
        />
      </div>

      {/* Members */}
      <HomecellMembers homecellId={homecell.id} members={members} />

      {/* Programs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Program Schedule
        </h2>

        {/* Create Program */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl p-4">
          <ProgramForm
            mode="create"
            initialData={{ homecellId: homecell.id }}
          />
        </div>

        {/* Programs List */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-2xl overflow-hidden">
          <Table
            data={programs}
            isLoading={programsLoading}
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Type", render: (p) => p.type?.name },
              { header: "Items", render: (p) => p.items?.length },
            ]}
            onRowClick={(p) => router.push(`/dashboard/programs/${p.id}`)}
            emptyMessage="No programs scheduled"
            actions={(p) => (
              <>
                <button
                  onClick={() =>
                    router.push(`/dashboard/programs/${p.id}/edit`)
                  }
                  className="text-[var(--main-gold)]"
                >
                  Edit
                </button>
              </>
            )}
          />
        </div>
        <button
          onClick={() =>
            router.push(`/dashboard/programs?homecellId=${homecell.id}`)
          }
          className="text-sm text-[var(--main-gold)]"
        >
          View all programs →
        </button>
      </div>
    </div>
  );
}
