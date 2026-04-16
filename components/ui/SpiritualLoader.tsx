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
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-[var(--bg-dark)] text-[var(--text-primary)]">
      {/* Animated Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        {/* Spinner */}
        <div className="relative w-20 h-20">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-[var(--border-soft)]"></div>

          {/* Rotating arc */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--main-gold)] animate-spin"></div>

          {/* Light pulse (sunrise effect) */}
          <motion.div
            className="absolute inset-4 rounded-full bg-[var(--card-elevated)] blur-md"
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Center dot (focus point) */}
          <div className="absolute inset-6 rounded-full bg-[var(--main-gold)] opacity-40"></div>
        </div>

        {/* Message */}
        <p className="text-sm text-[var(--text-secondary)] tracking-wide">{message}</p>

        {/* Scripture (optional) */}
        {showScripture && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-[var(--text-secondary)] italic text-center max-w-xs"
          >
            “Be still, and know that I am God.” – Psalm 46:10
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
