"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { InlineLoader } from "@/components/ui/InlineLoader";

export function RecordActionDialog({ actionKey, label, title, description, confirmLabel = label, pendingLabel, successMessage, onConfirm, busy = false, secondary = false, errorMessage = "Could not confirm the change. Review the refreshed status before trying again." }: {
  actionKey: string; label: string; title: string; description: string; confirmLabel?: string;
  pendingLabel: string; successMessage: string; onConfirm: () => Promise<unknown>; busy?: boolean; secondary?: boolean;
  errorMessage?: string;
}) {
  const [intent, setIntent] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progressLabel, setProgressLabel] = useState(pendingLabel);
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  // A refreshed record can invalidate the action that opened this dialog.
  const open = intent === actionKey;
  async function confirm() {
    if (pending || busy || !open) return;
    setProgressLabel(pendingLabel);
    setPending(true);
    setFeedback(null);
    try {
      await onConfirm();
      setIntent(null);
      setFeedback({ error: false, message: successMessage });
    } catch {
      setFeedback({ error: true, message: errorMessage });
    } finally { setPending(false); }
  }
  return <div className="record-transition">
    <button type="button" className={"record-button record-button-" + (secondary ? "secondary" : "primary")} disabled={pending || busy} onClick={() => { setFeedback(null); setIntent(actionKey); }}>{pending ? <InlineLoader message={progressLabel} /> : label}</button>
    {feedback && !open && <p className="record-action-feedback" role={feedback.error ? "alert" : "status"}>{feedback.message}</p>}
    <Dialog open={open} onClose={() => { if (!pending) setIntent(null); }} closeDisabled={pending} title={title} description={description}>
      {feedback?.error && <p role="alert" className="mb-5 text-sm leading-7 text-red-700">{feedback.message}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" className="record-button record-button-primary" disabled={pending || busy} onClick={() => { void confirm(); }}>{pending ? <InlineLoader message={progressLabel} /> : busy ? "Checking latest status…" : confirmLabel}</button>
        <button type="button" className="record-button record-button-secondary" disabled={pending} onClick={() => setIntent(null)}>Cancel</button>
      </div>
    </Dialog>
  </div>;
}
