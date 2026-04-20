"use client";

import { useState } from "react";
import { FiShare2 } from "react-icons/fi";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Native share (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch {
        // ignore cancel
      }
      return;
    }

    // Fallback → copy
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy link");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-lg border border-[#d8e2dc] bg-[#f4f8f5] px-4 py-2 text-sm font-semibold text-[#18342f] transition hover:border-[#18342f]/20 hover:shadow-sm"
    >
      <FiShare2 className="h-4 w-4" />

      {copied ? "Copied!" : "Share"}
    </button>
  );
}
