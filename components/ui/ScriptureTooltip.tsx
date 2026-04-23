"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ScriptureTooltip({
  book,
  chapter,
  verseFrom,
  verseTo,
  children,
}: any) {
  const [isVisible, setIsVisible] = useState(false);
  const [passage, setPassage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  const reference = `${book} ${chapter}:${verseFrom}${verseTo ? `-${verseTo}` : ""}`;

  const fetchPassage = async () => {
    if (passage) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://bible-api.com/${encodeURIComponent(reference)}`,
      );
      if (!res.ok) {
        setPassage("Verse not found");
        return;
      }
      const data = await res.json();
      setPassage(
        data.text?.replace(/\[\d+\]/g, "").trim() || "No text returned",
      );
    } catch {
      setPassage("Error loading verse");
    } finally {
      setLoading(false);
    }
  };

  const show = () => {
    setIsVisible(true);
    fetchPassage();
  };
  const hide = () => setIsVisible(false);

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(show, 300);
  };
  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current!);
    hide();
  };
  const handleClick = () => (isVisible ? hide() : show());

  useEffect(
    () => () => {
      clearTimeout(timeoutRef.current!);
    },
    [],
  );

  // Close on outside tap (mobile)
  useEffect(() => {
    if (!isVisible) return;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) hide();
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [isVisible]);

  return (
    <>
      <span
        ref={anchorRef}
        className="inline cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </span>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-9999 border-t border-[#c2620a]/30 bg-[#1a0a02]/96 px-6 py-5 shadow-2xl backdrop-blur-md"
          >
            <div className="mx-auto max-w-3xl text-center">
              {/* Reference label */}
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c2a23a]">
                {reference}
              </p>

              {/* Passage */}
              {loading ? (
                <p className="text-sm italic text-[#e6c79c]">Loading…</p>
              ) : (
                <p className="line-clamp-3 text-sm leading-relaxed text-[#fde5c0]">
                  {passage}
                </p>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                hide();
              }}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1 text-white/40 transition hover:text-white/80"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
