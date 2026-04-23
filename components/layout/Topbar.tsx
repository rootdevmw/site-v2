"use client";

import { useAttentionNotifications } from "@/app/modules/attention/hooks/useAttentionNotifications";
import { useLogout } from "@/app/modules/auth/hooks/useLogout";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const userRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const pageTitle = getPageTitle(pathname);
  const primaryRole = (user as any)?.roles?.[0] ?? null;
  const initials = user?.email?.[0]?.toUpperCase() ?? "?";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[var(--card-bg)] border-b border-[var(--border-soft)] shrink-0">
      {/* LEFT */}
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">
        {pageTitle}
      </h2>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {/* PRAYER ICON */}
        <button
          onClick={() => setOpen(true)}
          className="relative p-2 rounded-lg hover:bg-[var(--hover-soft)] transition"
        >
          <GiPrayer className="text-lg" />

          {counts.prayers > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-orange-500 text-white rounded-full">
              {counts.prayers}
            </span>
          )}
        </button>

        {/* VISITOR ICON */}
        <button
          onClick={() => setOpen(true)}
          className="relative p-2 rounded-lg hover:bg-[var(--hover-soft)] transition"
        >
          <FaPeoplePulling className="text-lg" />

          {counts.visitors > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-blue-500 text-white rounded-full">
              {counts.visitors}
            </span>
          )}
        </button>

        {/* DROPDOWN */}
        <div ref={notifRef} className="relative">
          {open && (
            <div className="absolute right-0 mt-2 w-96 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border-soft)] text-sm font-semibold">
                Attention Center
              </div>

              <div className="max-h-96 overflow-y-auto">
                {/* PRAYERS */}
                <div className="px-4 py-2 text-xs font-semibold text-orange-400 uppercase">
                  Prayer Requests ({counts.prayers})
                </div>

                {prayers.length === 0 && (
                  <p className="px-4 py-2 text-sm text-[var(--text-secondary)]">
                    No pending prayers
                  </p>
                )}

                {prayers.map((n) => (
                  <a
                    key={`p-${n.id}`}
                    href="/dashboard/attention"
                    className="block px-4 py-2 hover:bg-[var(--hover-soft)]"
                  >
                    <p className="text-sm text-[var(--text-primary)] flex gap-2 items-center">
                      <GiPrayer /> {n.name}
                    </p>
                  </a>
                ))}

                {/* VISITORS */}
                <div className="px-4 py-2 text-xs font-semibold text-blue-400 uppercase mt-2">
                  Visitors ({counts.visitors})
                </div>

                {visitors.length === 0 && (
                  <p className="px-4 py-2 text-sm text-[var(--text-secondary)]">
                    No pending visitors
                  </p>
                )}

                {visitors.map((n) => (
                  <a
                    key={`v-${n.id}`}
                    href="/dashboard/attention"
                    className="block px-4 py-2 hover:bg-[var(--hover-soft)]"
                  >
                    <p className="text-sm text-[var(--text-primary)] flex gap-2 items-center">
                      <FaPeoplePulling /> {n.name}
                    </p>
                  </a>
                ))}
              </div>

              <a
                href="/dashboard/attention"
                className="block text-center py-2 text-[var(--main-gold)] hover:bg-[var(--hover-soft)]"
              >
                Manage Attention →
              </a>
            </div>
          )}
        </div>

        {/* USER */}
        <div
          ref={userRef}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--hover-soft)]"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--main-gold)] text-black flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm text-[var(--text-primary)]">{user?.email}</p>
            {primaryRole && (
              <p className="text-[10px] text-[var(--text-secondary)]">
                {primaryRole}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
