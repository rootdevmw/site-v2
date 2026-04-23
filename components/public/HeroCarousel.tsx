"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  "/IMGL8976.jpg",
  "/IMGL8974.jpg",
  "/IMGL8937.jpg",
  "/IMGL8012.jpg",
  "/IMGL7930.jpg",
  "/IMGL7923.jpg",
  "/IMGL7896.jpg",
  "/DSC_0085.jpg",
  "/DSC_0126.jpg",
  "/IMG_0075.jpg",
];

const INTERVAL = 3000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % slides.length),
    [],
  );
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    [],
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <>
      {/* Crossfading images — blur-fill so full image is visible with no cropping */}
      {slides.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden
        >
          {/* Blurred fill layer — covers gaps left by object-contain */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
            style={{ opacity: 0.35 }}
          />
          {/* Full image — no cropping */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: 0.7 }}
          />
        </div>
      ))}

      {/* Prev arrow */}
      <button
        onClick={() => {
          prev();
          setPaused(true);
        }}
        aria-label="Previous image"
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/25 p-2 text-white/80 backdrop-blur-sm transition hover:bg-black/45 hover:text-white sm:left-5"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        onClick={() => {
          next();
          setPaused(true);
        }}
        aria-label="Next image"
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/25 p-2 text-white/80 backdrop-blur-sm transition hover:bg-black/45 hover:text-white sm:right-5"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              setPaused(true);
            }}
            aria-label={`Slide ${i + 1}`}
            className="transition-all duration-300"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              borderRadius: 9999,
              background:
                i === current
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </>
  );
}
