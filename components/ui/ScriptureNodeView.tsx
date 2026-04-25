"use client";

import { NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export function ScriptureNodeView({ node }: ReactNodeViewProps) {
  const { book, chapter, verseFrom, verseTo } = node.attrs;

  const [open, setOpen] = useState(false); // click-controlled
  const [hovering, setHovering] = useState(false); // hover-controlled
  const [passage, setPassage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeout = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  const reference = `${book} ${chapter}:${verseFrom}${verseTo ? `-${verseTo}` : ""}`;

  const fetchPassage = async () => {
    if (passage) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://bible-api.com/${encodeURIComponent(reference)}`,
      );
      const data = await res.json();
      setPassage(
        data.text?.replace(/\[\d+\]/g, "").trim() || "Verse not found",
      );
    } catch {
      setPassage("Error loading verse");
    } finally {
      setLoading(false);
    }
  };

  const updatePosition = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
    });
  };

  const openPreview = () => {
    if (window.matchMedia("(hover: none)").matches) return;

    hoverTimeout.current = window.setTimeout(() => {
      updatePosition();
      setHovering(true);
      fetchPassage();
    }, 150);
  };

  const closePreview = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHovering(false);
  };

  const handleClick = () => {
    updatePosition();
    const next = !open;
    setOpen(next);
    if (next) fetchPassage();
  };

  const closeAll = () => {
    setOpen(false);
    setHovering(false);
  };

  const visible = open || hovering;

  // outside click + ESC (ONLY closes click-open)
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        !popupRef.current?.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        closeAll();
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <>
      <NodeViewWrapper
        as="span"
        ref={anchorRef}
        onMouseEnter={openPreview}
        onMouseLeave={closePreview}
        onClick={handleClick}
        className="inline cursor-pointer font-semibold text-[var(--main-gold)] hover:underline"
      >
        {reference}
      </NodeViewWrapper>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {visible && (
              <motion.div
                ref={popupRef}
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: "absolute",
                  top: position.top,
                  left: position.left,
                  zIndex: 9999,
                }}
                className="w-[320px] sm:w-[380px] max-w-[90vw] rounded-xl border border-[#c2620a]/20 bg-[#1a0a02] shadow-2xl"
              >
                {/* HEADER */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#c2620a]/20">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#c2a23a]">
                    {reference}
                  </p>
                  {!open && passage && (
                    <p className="mt-3 text-[11px] text-[#c2a23a]/70 italic text-center">
                      Click the verse to read more
                    </p>
                  )}
                  {open && (
                    <button
                      onClick={closeAll}
                      className="text-white/40 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* BODY */}
                <div className="max-h-[260px] overflow-y-auto px-4 py-4 text-sm leading-relaxed text-[#fde5c0] whitespace-pre-line">
                  {loading ? (
                    <p className="italic text-[#e6c79c]">Loading…</p>
                  ) : (
                    passage
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
