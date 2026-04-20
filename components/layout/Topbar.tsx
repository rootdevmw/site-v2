"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { useLogout } from "@/app/modules/auth/hooks/useLogout";
import { showError, showSuccess } from "@/lib/toast";

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return "Dashboard";
  const section = segments[1];
  return section
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function Topbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const pageTitle = getPageTitle(pathname);
  const primaryRole = (user as any)?.roles?.[0] ?? null;
  const initials = user?.email?.[0]?.toUpperCase() ?? "?";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[var(--card-bg)] border-b border-[var(--border-soft)] shrink-0">
      {/* Left — page title */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          {pageTitle}
        </h2>
      </div>

      {/* Right — user menu */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--hover-soft)] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--main-gold)] text-black flex items-center justify-center text-sm font-semibold ring-2 ring-[var(--main-gold)]/30">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm leading-none text-[var(--text-primary)]">
              {user?.email}
            </p>
            {primaryRole && (
              <p className="mt-0.5 text-[10px] text-[var(--text-secondary)]">
                {primaryRole}
              </p>
            )}
          </div>
          <svg
            className="h-3.5 w-3.5 text-[var(--text-secondary)] hidden sm:block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-60 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl shadow-xl z-50 overflow-hidden">
            {/* User info header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-[var(--border-soft)]">
              <div className="w-9 h-9 rounded-full bg-[var(--main-gold)] text-black flex items-center justify-center text-sm font-semibold shrink-0 ring-2 ring-[var(--main-gold)]/30">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {user?.email}
                </p>
                {primaryRole && (
                  <span className="mt-1 inline-flex items-center rounded-full bg-[var(--main-gold)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--main-gold)]">
                    {primaryRole}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                onClick={() => {
                  logout.mutate(undefined, {
                    onSuccess: () => {
                      showSuccess("Logged out successfully");
                      setUser(null);
                      window.location.href = "/login";
                    },
                    onError: () => {
                      showError("Logout failed");
                    },
                  });
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
