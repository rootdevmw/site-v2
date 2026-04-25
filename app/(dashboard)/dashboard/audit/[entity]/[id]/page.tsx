"use client";

import { useParams } from "next/navigation";
import { AuditLog } from "./AuditLog";
import { useAuditTimeline } from "@/app/modules/audit/hooks/useAuditTimeline";

export default function AuditDetailPage() {
  const { entity, id } = useParams();

  const { data, isLoading } = useAuditTimeline({
    entity: String(entity),
    id: String(id),
  });

  const logs = data ?? [];
  if (isLoading) {
    return (
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-[var(--text-secondary)]">
            Loading audit trail...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <AuditLog entries={logs} />
      </div>
    </div>
  );
}
