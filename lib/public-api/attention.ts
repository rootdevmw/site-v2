"use client";

import { useState } from "react";
import { publicApi } from "@/lib/public-api/client";

export function usePrayerRequest() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitPrayerRequest(form: any) {
    setIsSubmitting(true);

    try {
      const res = await publicApi("/attention/prayer-requests", {
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
    submitPrayerRequest,
    isSubmitting,
  };
}

export function useVisitor() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitVisitor(form: any) {
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
