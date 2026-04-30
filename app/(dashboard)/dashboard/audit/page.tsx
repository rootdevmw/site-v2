"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { TableLayout } from "@/components/ui/TableLayout";
import { Input } from "@/components/ui/Input";

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

  "PUBLICATION",
  "PRAYER_REQUEST",

  "STREAM",
  "STREAM_PLATFORM",
  "PLATFORM",

  "MEDIA",

  "VISITOR",
  "SCRIPTURE_REF",
  "SERIES",
  "ATTENTION_ACTION",

  "USERROLE",
  "PRAYERWARRIOR",
];

const formatLabel = (entity: string) =>
  entity.toLowerCase().replace(/_/g, " ");

export default function AuditHomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredEntities = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ENTITIES;

    return ENTITIES.filter((e) =>
      e.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <TableLayout
      title="Audit Logs"
      description="Track all system changes across the platform"
      filters={
        <div className="space-y-3">
          <Input
            label="Search entities"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. member, content, event..."
          />
        </div>
      }
    >
      {filteredEntities.length === 0 ? (
        <div className="text-sm text-[var(--text-secondary)]">
          No entities found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => (
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
      )}
    </TableLayout>
  );
}