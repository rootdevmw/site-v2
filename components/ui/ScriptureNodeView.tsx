"use client";

import { NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export function ScriptureNodeView({ node }: ReactNodeViewProps) {
  const { book, chapter, verseFrom, verseTo } = node.attrs;

  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [passage, setPassage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const anchorRef = useRef<HTMLSpanElement | null>(null);

  const visible = isOpen || isHovering;

  const reference = `${book} ${chapter}:${verseFrom}${
    verseTo ? `-${verseTo}` : ""
  }`;

  const fetchPassage = async () => {
    if (passage) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://bible-api.com/${encodeURIComponent(reference)}`,
      );
      const data = await res.json();

      const clean =
        data.text?.replace(/\[\d+\]/g, "").trim() || "Verse not found";

      setPassage(clean);
    } catch {
      setPassage("Error loading verse");
    } finally {
      setLoading(false);
    }
  };

  //  HOVER (desktop preview)
  const handleMouseEnter = () => {
    if (window.matchMedia("(hover: none)").matches) return; // ignore mobile

    timeoutRef.current = window.setTimeout(() => {
      setIsHovering(true);
      fetchPassage();
    }, 250);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setIsHovering(false);
  };

  //  CLICK (primary interaction)
  const handleClick = () => {
    setIsOpen((prev) => !prev);
    fetchPassage();
  };

  //  CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  //  POSITION CALC
  const rect = anchorRef.current?.getBoundingClientRect();

  return (
    <>
      <NodeViewWrapper
        as="span"
        ref={anchorRef}
        className="inline-block cursor-pointer text-[var(--main-gold)] font-semibold hover:underline"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {book} {chapter}:{verseFrom}
        {verseTo ? `-${verseTo}` : ""}
      </NodeViewWrapper>

      {/*  PORTAL TOOLTIP */}
      {visible &&
        rect &&
        createPortal(
          <div
            className="fixed z-[9999] p-4 rounded-lg shadow-lg text-sm bg-[var(--card-bg)] border border-[var(--border-soft)]"
            style={{
              top: rect.top - 10,
              left: rect.left + rect.width / 2,
              transform: "translate(-50%, -100%)",
              width: "min(20rem, 90vw)",
              maxHeight: 260,
              overflow: "auto",
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {loading ? (
              <div className="text-[var(--text-secondary)]">
                Loading scripture...
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-[var(--text-primary)]">
                {passage}
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
