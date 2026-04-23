"use client";

import { NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export function ScriptureNodeView({ node }: ReactNodeViewProps) {
  const { book, chapter, verseFrom, verseTo } = node.attrs;

  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [passage, setPassage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const anchorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => setMounted(true), []);

  const visible = isOpen || isHovering;

  const reference = `${book} ${chapter}:${verseFrom}${verseTo ? `-${verseTo}` : ""}`;

  const fetchPassage = async () => {
    if (passage) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://bible-api.com/${encodeURIComponent(reference)}`,
      );
      const data = await res.json();
      setPassage(data.text?.replace(/\[\d+\]/g, "").trim() || "Verse not found");
    } catch {
      setPassage("Error loading verse");
    } finally {
      setLoading(false);
    }
  };

  // Hover — desktop only
  const handleMouseEnter = () => {
    if (window.matchMedia("(hover: none)").matches) return;
    timeoutRef.current = window.setTimeout(() => {
      setIsHovering(true);
      fetchPassage();
    }, 250);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current!);
    setIsHovering(false);
  };

  // Click — primary interaction on mobile
  const handleClick = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchPassage();
  };

  const closeAll = () => {
    setIsOpen(false);
    setIsHovering(false);
  };

  // Close when clicking/tapping outside the anchor
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [isOpen]);

  useEffect(() => () => { clearTimeout(timeoutRef.current!); }, []);

  const bar = (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 36 }}
          className="fixed bottom-0 left-0 right-0 z-9999 border-t border-[#c2620a]/30 bg-[#1a0a02]/95 px-6 py-5 shadow-2xl backdrop-blur-md"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c2a23a]">
              {reference}
            </p>
            {loading ? (
              <p className="text-sm italic text-[#e6c79c]">Loading…</p>
            ) : (
              <p className="line-clamp-3 text-sm leading-relaxed text-[#fde5c0]">
                {passage}
              </p>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); closeAll(); }}
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
  );

  return (
    <>
      <NodeViewWrapper
        as="span"
        ref={anchorRef}
        className="inline-block cursor-pointer font-semibold text-(--main-gold) hover:underline"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {book} {chapter}:{verseFrom}
        {verseTo ? `-${verseTo}` : ""}
      </NodeViewWrapper>

      {/* Portal to document.body — escapes any CSS transform/overflow on ancestors */}
      {mounted && createPortal(bar, document.body)}
    </>
  );
}
