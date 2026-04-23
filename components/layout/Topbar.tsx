"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { useLogout } from "@/app/modules/auth/hooks/useLogout";
import { showError, showSuccess } from "@/lib/toast";

import { useAttentionNotifications } from "@/app/modules/attention/hooks/useAttentionNotifications";
import { FaPeoplePulling } from "react-icons/fa6";
import { GiPrayer } from "react-icons/gi";

function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return "Dashboard";

  return segments[1]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function Topbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useLogout();

  const {
    notifications = [],
    prayers = [],
    visitors = [],
    counts = { prayers: 0, visitors: 0 },
  } = useAttentionNotifications() || {};

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
      {/* LEFT */}
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">
        {pageTitle}
      </h2>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {/* Prayer */}
        <button className="relative p-2 rounded-lg hover:bg-[var(--hover-soft)]">
          <GiPrayer className="text-lg" />
          {counts.prayers > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-orange-500 text-white rounded-full">
              {counts.prayers}
            </span>
          )}
        </button>

        {/* Visitors */}
        <button className="relative p-2 rounded-lg hover:bg-[var(--hover-soft)]">
          <FaPeoplePulling className="text-lg" />
          {counts.visitors > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-blue-500 text-white rounded-full">
              {counts.visitors}
            </span>
          )}
        </button>

        {/* USER DROPDOWN */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--hover-soft)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--main-gold)] text-black flex items-center justify-center text-sm font-semibold ring-2 ring-[var(--main-gold)]/30">
              {initials}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm text-[var(--text-primary)]">
                {user?.email}
              </p>
              {primaryRole && (
                <p className="text-[10px] text-[var(--text-secondary)]">
                  {primaryRole}
                </p>
              )}
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-60 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl shadow-xl z-50 overflow-hidden">
              {/* header */}
              <div className="px-4 py-3 border-b border-[var(--border-soft)]">
                <p className="text-sm text-[var(--text-primary)]">
                  {user?.email}
                </p>
                {primaryRole && (
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {primaryRole}
                  </span>
                )}
              </div>

              {/* logout (UNCHANGED LOGIC) */}
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
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
