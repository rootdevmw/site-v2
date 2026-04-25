"use client";

import { useRouter } from "next/navigation";
import { TableLayout } from "@/components/ui/TableLayout";

const ENTITIES = [
  "USER",
  "ROLE",
  "SESSION",
  "AUDIT_LOG",

  "MEMBER",
  "MEMBER_BIO",
  "MEMBER_MINISTRY",

  "MINISTRY",
  "HOMECELL",

  "CONTENT",
  "CONTENT_MEDIA",
  "CONTENT_TAG",
  "CONTENT_TYPE",
  "TAG",

  "EVENT",
  "EVENT_MEDIA",
  "EVENT_MINISTRY",
  "EVENT_TYPE",

  "PROGRAM",
  "PROGRAM_ITEM",
  "PROGRAM_TEMPLATE",
  "PROGRAM_TEMPLATE_ITEM",
  "PROGRAM_TYPE",

  "NEWSLETTER",
  "ANNOUNCEMENT",
  "ANNOUNCEMENT_TARGET",
  "PRAYER_REQUEST",

  "STREAM",
  "STREAM_PLATFORM",
  "PLATFORM",

  "MEDIA",

  "VISITOR",
  "SCRIPTURE_REF",
  "SERIES",
  "ATTENTION_ACTION",

  "USER_ROLE",
];

const formatLabel = (entity: string) => entity.toLowerCase().replace(/_/g, " ");

export default function AuditHomePage() {
  const router = useRouter();

  return (
    <TableLayout
      title="Audit Logs"
      description="Track all system changes across the platform"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ENTITIES.map((entity) => (
          <button
            key={entity}
            onClick={() => router.push(`/dashboard/audit/${entity}`)}
            className="
              p-5 rounded-2xl text-left
              bg-[var(--card-bg)]
              border border-[var(--border-soft)]
              hover:bg-[var(--hover-soft)]
              transition-all duration-200
            "
          >
            <p className="text-[var(--text-primary)] font-medium capitalize">
              {formatLabel(entity)}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              View change history
            </p>
          </button>
        ))}
      </div>
    </TableLayout>
  );
}
