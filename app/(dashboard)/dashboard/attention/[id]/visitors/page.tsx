"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { FiCheck, FiCheckCircle } from "react-icons/fi";
import { useGetVisitor } from "@/app/modules/attention/hooks/useGetVisitor";
import { useAttentionActions } from "@/app/modules/attention/hooks/useAttentionActions";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { hasRequiredRole } from "@/lib/auth/roles";
import { getVisitorState } from "@/lib/utils/record-details";
import { VisitorRecordView } from "@/components/records/VisitorRecordView";
import { RecordFeedback, RecordLoadError, RecordSkeleton } from "@/components/records/RecordLayout";
import { InlineLoader } from "@/components/ui/InlineLoader";

export default function VisitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const permitted = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const query = useGetVisitor(id, permitted);
  const { markVisitor } = useAttentionActions();
  const submitting = useRef(false);
  const [feedback, setFeedback] = useState<{ id: string; failed: boolean; message: string } | null>(null);

  async function acknowledge() {
    const visitor = query.data;
    if (!permitted || !visitor || query.isFetching || !getVisitorState(visitor.status).canAcknowledge || submitting.current) return;
    submitting.current = true;
    setFeedback(null);
    try {
      await markVisitor.mutateAsync(visitor.id);
      setFeedback({ id, failed: false, message: "The visitor’s welcome has been acknowledged." });
    } catch {
      setFeedback({ id, failed: true, message: "The action could not be confirmed. Check the current status, then try again if the visitor is still awaiting a welcome." });
    } finally {
      submitting.current = false;
    }
  }

  if (!permitted) return <RecordFeedback kind="forbidden" entity="Visitor" backHref="/dashboard" backLabel="Return to dashboard" />;
  if (query.isPending) return <RecordSkeleton label="Loading visitor details…" />;
  if (query.isError) return <RecordLoadError error={query.error} entity="Visitor" backHref="/dashboard/attention/visitors" backLabel="Back to visitors" onRetry={() => { void query.refetch(); }} retrying={query.isFetching} />;
  if (!query.data) return <RecordFeedback kind="missing" entity="Visitor" backHref="/dashboard/attention/visitors" backLabel="Back to visitors" />;

  const visitor = query.data;
  const state = getVisitorState(visitor.status);
  return <VisitorRecordView visitor={visitor}
    followUpAction={state.canAcknowledge ? <button type="button" onClick={acknowledge} disabled={markVisitor.isPending || query.isFetching} aria-busy={markVisitor.isPending} className="record-button record-button-primary">
      {markVisitor.isPending ? <InlineLoader message="Acknowledging visitor…" /> : <><FiCheck aria-hidden="true" />Acknowledge visitor</>}
    </button> : visitor.status === "CONFIRMED" || visitor.status === "COMPLETED" ? <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#365c29]"><FiCheckCircle aria-hidden="true" />{visitor.status === "COMPLETED" ? "Visit completed" : "Welcome acknowledged"}</span> : null}
    feedback={feedback?.id === id && <p role={feedback.failed ? "alert" : "status"} className={"rounded-xl border px-4 py-3 text-sm leading-7 " + (feedback.failed ? "border-red-200 bg-red-50 text-red-900" : "border-[#d7e8cf] bg-[#edf5e9] text-[#365c29]")}>{feedback.message}</p>}
  />;
}
