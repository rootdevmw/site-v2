"use client";

import { useState } from "react";
import { MemberForm } from "@/app/modules/members/components/MemberForm";
import { CsvMemberImport } from "@/app/modules/members/components/CsvMemberImport";

type Tab = "single" | "csv";

export default function CreateMemberPage() {
  const [tab, setTab] = useState<Tab>("single");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-(--text-primary)">
          Add Member
        </h1>
        <p className="text-sm text-(--text-secondary)">
          Register a new church member
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-(--card-elevated) rounded-xl w-fit border border-(--border-soft)">
        {(["single", "csv"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              tab === t
                ? "bg-(--card-bg) text-(--text-primary) shadow-sm"
                : "text-(--text-secondary) hover:text-(--text-primary)"
            }`}
          >
            {t === "single" ? "Single" : "Import CSV"}
          </button>
        ))}
      </div>

      <div className="bg-(--card-bg) border border-(--border-soft) rounded-2xl shadow-sm p-6">
        {tab === "single" ? (
          <MemberForm mode="create" initialData={{}} />
        ) : (
          <CsvMemberImport />
        )}
      </div>
    </div>
  );
}
