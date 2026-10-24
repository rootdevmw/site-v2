"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FiCheck, FiCheckCircle } from "react-icons/fi";
import { useGetPrayer } from "@/app/modules/attention/hooks/useGetPrayer";
import { useAttentionActions } from "@/app/modules/attention/hooks/useAttentionActions";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getPrayerState } from "@/lib/utils/record-details";
import { PrayerRecordView } from "@/components/records/PrayerRecordView";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";
import { InlineLoader } from "@/components/ui/InlineLoader";

export default function PrayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useGetPrayer(id, permitted);
  const { markPrayer } = useAttentionActions();
  const submitting = useRef(false);
  const [feedback, setFeedback] = useState<{ id: string; failed: boolean; message: string } | null>(null);

  async function handlePrayed() {
    const prayer = query.data;
    if (!permitted || !prayer || query.isFetching || !getPrayerState(prayer.status).canMarkPrayed || submitting.current) return;
    submitting.current = true;
    setFeedback(null);
    try {
      await markPrayer.mutateAsync(prayer.id);
      setFeedback({ id, failed: false, message: "This request has been marked as prayed." });
    } catch {
      setFeedback({ id, failed: true, message: "The action could not be confirmed. Check the current status, then try again if it is still awaiting prayer." });
    } finally {
      submitting.current = false;
    }
  }

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Prayer request" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading prayer request…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Prayer request" backHref="/dashboard/attention/prayers" backLabel="Back to prayer requests" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data) return <RecordFeedback kind="missing" entity="Prayer request" backHref="/dashboard/attention/prayers" backLabel="Back to prayer requests" />;

  const prayer = query.data;
  const state = getPrayerState(prayer.status);
  return <PrayerRecordView prayer={prayer}
    followUpAction={state.canMarkPrayed ? <button type="button" onClick={handlePrayed} disabled={markPrayer.isPending || query.isFetching} aria-busy={markPrayer.isPending} className="record-button record-button-primary">
      {markPrayer.isPending ? <InlineLoader message="Recording prayer…" /> : <><FiCheck aria-hidden="true" />Mark as prayed</>}
    </button> : prayer.status === "PRAYED_FOR" ? <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#365c29]"><FiCheckCircle aria-hidden="true" />Prayer recorded</span> : null}
    feedback={feedback?.id === id && <p role={feedback.failed ? "alert" : "status"} className={"rounded-xl border px-4 py-3 text-sm leading-7 " + (feedback.failed ? "border-red-200 bg-red-50 text-red-900" : "border-[#d7e8cf] bg-[#edf5e9] text-[#365c29]")}>{feedback.message}</p>}
  />;
}
