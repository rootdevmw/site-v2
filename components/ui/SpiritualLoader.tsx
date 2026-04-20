"use client";

import { motion } from "framer-motion";

type Props = {
  message?: string;
  showScripture?: boolean;
};

export function SpiritualLoader({
  message = "Preparing your space...",
  showScripture = true,
}: Props) {
  return (
    <div className="flex flex-1 min-h-[320px] flex-col items-center justify-center gap-6 text-[var(--text-primary)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-[var(--border-soft)]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--main-gold)] animate-spin" />
          <motion.div
            className="absolute inset-3 rounded-full bg-[var(--card-elevated)] blur-sm"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-5 rounded-full bg-[var(--main-gold)] opacity-30" />
        </div>

        <p className="text-sm text-[var(--text-secondary)] tracking-wide">
          {message}
        </p>

        {showScripture && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-[var(--text-secondary)] italic text-center max-w-xs"
          >
            "Be still, and know that I am God." – Psalm 46:10
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
