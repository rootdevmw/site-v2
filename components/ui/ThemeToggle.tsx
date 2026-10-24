"use client";

import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

const STORAGE_KEY = "redcross_theme";

function getTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

function applyTheme(next: "dark" | "light") {
  const root = document.documentElement;
  root.setAttribute("data-theme", next);
  if (next === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {}
}

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    setTheme(getTheme());

    // Sync across tabs
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
        setTheme(e.newValue);
        applyTheme(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: showLabel ? "6px" : "0",
        padding: showLabel ? "6px 14px 6px 10px" : "0",
        width: showLabel ? "auto" : "40px",
        height: "40px",
        justifyContent: "center",
        borderRadius: "9999px",
        border: "2px solid #f7941d",
        background: "#f7941d",
        color: "#1a1612",
        cursor: "pointer",
        transition: "background 0.2s, transform 0.1s",
        flexShrink: 0,
        fontWeight: 700,
        fontSize: "13px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#ffac3b";
        e.currentTarget.style.borderColor = "#ffac3b";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f7941d";
        e.currentTarget.style.borderColor = "#f7941d";
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {isDark ? (
        <FiSun style={{ width: "18px", height: "18px" }} aria-hidden="true" />
      ) : (
        <FiMoon style={{ width: "18px", height: "18px" }} aria-hidden="true" />
      )}
      {showLabel && <span>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}
