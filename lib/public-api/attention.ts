"use client";

import { useRef, useState } from "react";
import type { PrayerSubmission } from "@/lib/utils/public-prayer";
import { publicApi } from "@/lib/public-api/client";

export function usePrayerRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const busy = useRef(false);

  async function submitPrayerRequest(form: PrayerSubmission) {
    if (form.shareWithElders === "No")
      throw new Error("Private prayers are not submitted.");
    if (busy.current) throw new Error("A submission is already pending.");
    busy.current = true;
    setIsSubmitting(true);

    try {
      const res = await publicApi("/attention/prayer-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.success === false)
        throw new Error("Submission could not be confirmed.");
      return res;
    } finally {
      setIsSubmitting(false);
      busy.current = false;
    }
  }

  return {
    submitPrayerRequest,
    isSubmitting,
  };
}

export function useVisitor() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitVisitor(form: Record<string, unknown>) {
    setIsSubmitting(true);

    try {
      const res = await publicApi("/attention/visitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      return res;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    submitVisitor,
    isSubmitting,
  };
}
