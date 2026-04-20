"use client";

import { useState, useRef, useEffect } from "react";

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

  const reference = `${book} ${chapter}:${verseFrom}${
    verseTo ? `-${verseTo}` : ""
  }`;

  //  FETCH
  const fetchPassage = async () => {
    if (passage) {
      return;
    }

    setLoading(true);

    try {
      const url = `https://bible-api.com/${encodeURIComponent(reference)}`;

      const response = await fetch(url);

      if (!response.ok) {
        setPassage("Verse not found");
        return;
      }
      const data = await response.json();
      const cleanText =
        data.text?.replace(/\[\d+\]/g, "").trim() || "No text returned";

      setPassage(cleanText);
    } catch (error) {
      setPassage("Error loading verse");
    } finally {
      setLoading(false);
    }
  };

  //  EVENTS
  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      fetchPassage();
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span
      className="relative inline-block cursor-help"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          className="absolute z-[9999] bottom-full left-1/2 -translate-x-1/2 mb-2 p-4 bg-black text-white rounded shadow-lg"
          style={{
            width: "min(20rem, 90vw)",
            maxHeight: 260,
            overflow: "auto",
          }}
        >
          {loading ? <div>Loading...</div> : <div>{passage}</div>}
        </div>
      )}
    </span>
  );
}
