"use client";

import { useParams, useRouter } from "next/navigation";
import { TableLayout } from "@/components/ui/TableLayout";
import { showError, showSuccess } from "@/lib/toast";

import { useGetPrayer } from "@/app/modules/attention/hooks/useGetPrayer";
import { useAttentionActions } from "@/app/modules/attention/hooks/useAttentionActions";

export default function PrayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: item, isLoading, isError } = useGetPrayer(id);
  const { markPrayer } = useAttentionActions();

  async function handlePrayed() {
    if (!item) return;

    try {
      await markPrayer.mutateAsync(item.id);
      showSuccess("Marked as prayed");
      router.push("/dashboard/attention");
    } catch {
      showError("Failed to update");
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError || !item) return <div className="p-6">Not found</div>;

  return (
    <TableLayout
      title="Prayer Request"
      description="Full prayer request details"
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

          {"phone" in item && item.phone && (
            <p>
              <b>Phone:</b> {item.phone}
            </p>
          )}

          {"email" in item && item.email && (
            <p>
              <b>Email:</b> {item.email}
            </p>
          )}

          <p>
            <b>Status:</b> {item.status}
          </p>

          <p>
            <b>Created:</b> {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>

        {/* ───────── PRAYER DETAILS ───────── */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl p-5 space-y-2">
          <h3 className="font-semibold">Prayer Details</h3>

          <p>
            <b>Prayer For:</b> {item.prayerFor}
          </p>

          <p>
            <b>Urgent:</b> {item.isUrgent ? "Yes" : "No"}
          </p>

          <p>
            <b>Share with Elders:</b> {item.shareWithElders ? "Yes" : "No"}
          </p>

          <p className="whitespace-pre-wrap">
            <b>Request:</b> {item.request}
          </p>
        </div>

        {/* ───────── ACTIONS ───────── */}
        <div className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl p-5 flex justify-between">
          <div>
            <h3 className="font-semibold">Actions</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Mark this prayer as handled
            </p>
          </div>

          <button
            onClick={handlePrayed}
            disabled={markPrayer.isPending}
            className="px-4 py-2 rounded-lg bg-[var(--main-gold)] text-black"
          >
            Mark as Prayed
          </button>
        </div>
      </div>
    </TableLayout>
  );
}
