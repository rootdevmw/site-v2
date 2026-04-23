"use client";

import { useParams, useRouter } from "next/navigation";
import { TableLayout } from "@/components/ui/TableLayout";
import { showError, showSuccess } from "@/lib/toast";

import { useGetVisitor } from "@/app/modules/attention/hooks/useGetVisitor";
import { useAttentionActions } from "@/app/modules/attention/hooks/useAttentionActions";

export default function AttentionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: item, isLoading, isError } = useGetVisitor(id);
  const { markVisitor } = useAttentionActions();

  async function handleAcknowledge() {
    if (!item) return;

    try {
      await markVisitor.mutateAsync(item.id);
      showSuccess("Visitor acknowledged");
      router.push("/dashboard/attention");
    } catch {
      showError("Failed to update");
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError || !item) return <div className="p-6">Not found</div>;

  return (
    <TableLayout
      title="Visitor Details"
      description="Full visitor record"
      actions={
        <button
          onClick={() => router.push("/dashboard/attention")}
          className="px-4 py-2 rounded-lg text-sm bg-[var(--card-elevated)] border border-[var(--border-soft)]"
        >
          ← Back
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ───────── BASIC INFO ───────── */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl p-5 space-y-2">
          <h3 className="font-semibold">Basic Info</h3>

          <p>
            <b>Name:</b> {item.name || "Anonymous"}
          </p>
          <p>
            <b>Phone:</b> {item.phone || "—"}
          </p>
          <p>
            <b>Email:</b> {item.email || "—"}
          </p>
          <p>
            <b>Status:</b> {item.status}
          </p>
          <p>
            <b>Created:</b> {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>

        {/* ───────── VISIT DETAILS ───────── */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl p-5 space-y-2">
          <h3 className="font-semibold">Visit Details</h3>

          <p>
            <b>Visit Date:</b> {new Date(item.visitDate).toLocaleDateString()}
          </p>

          <p>
            <b>Group Size:</b> {item.groupSize}
          </p>

          <p>
            <b>Church of Christ:</b> {item.isChurchOfChrist || "—"}
          </p>

          <p>
            <b>Language:</b> {item.language || "—"}
          </p>

          <p>
            <b>Has Special Needs:</b> {item.hasSpecialNeeds ? "Yes" : "No"}
          </p>

          {item.hasSpecialNeeds && (
            <p>
              <b>Special Needs:</b> {item.specialNeedsDetails || "—"}
            </p>
          )}

          <p className="whitespace-pre-wrap">
            <b>Message:</b> {item.message || "—"}
          </p>
        </div>

        {/* ───────── ACTIONS ───────── */}
        <div className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl p-5 flex justify-between">
          <div>
            <h3 className="font-semibold">Actions</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Record ministry response
            </p>
          </div>

          <button
            onClick={handleAcknowledge}
            disabled={markVisitor.isPending}
            className="px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black"
          >
            Acknowledge Visitor
          </button>
        </div>
      </div>
    </TableLayout>
  );
}
