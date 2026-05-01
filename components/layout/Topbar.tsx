"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { useLogout } from "@/app/modules/auth/hooks/useLogout";
import { showError, showSuccess } from "@/lib/toast";
import { getHighestRole, hasRequiredRole } from "@/lib/auth/roles";

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
    prayers = [],
    visitors = [],
    counts = { prayers: 0, visitors: 0 },
  } = useAttentionNotifications() || {};

  //  Separate states
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  //  Refs
  const userRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const pageTitle = getPageTitle(pathname);
  const primaryRole = getHighestRole((user as any)?.roles ?? []);
  const initials = user?.email?.[0]?.toUpperCase() ?? "?";
  const canManageAttention = hasRequiredRole((user as any)?.roles ?? [], [
    "DEACON",
  ]);

  //  Handle outside clicks (both dropdowns)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }

      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserOpen(false);
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
      <div className="flex items-center gap-2 relative">
        {/* PRAYER */}
        {canManageAttention && (
          <>
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative p-2 rounded-lg hover:bg-[var(--hover-soft)]"
            >
              <GiPrayer className="text-lg" />
              {counts.prayers > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-orange-500 text-white rounded-full">
                  {counts.prayers}
                </span>
              )}
            </button>

            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative p-2 rounded-lg hover:bg-[var(--hover-soft)]"
            >
              <FaPeoplePulling className="text-lg" />
              {counts.visitors > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-blue-500 text-white rounded-full">
                  {counts.visitors}
                </span>
              )}
            </button>
          </>
        )}

        {/* NOTIFICATIONS DROPDOWN */}
        <div ref={notifRef} className="relative">
          {canManageAttention && notifOpen && (
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

                {prayers.map((n: any) => (
                  <a
                    key={`p-${n.id}`}
                    href="/dashboard/attention"
                    className="block px-4 py-2 hover:bg-[var(--hover-soft)]"
                  >
                    <p className="text-sm flex gap-2 items-center">
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

                {visitors.map((n: any) => (
                  <a
                    key={`v-${n.id}`}
                    href="/dashboard/attention"
                    className="block px-4 py-2 hover:bg-[var(--hover-soft)]"
                  >
                    <p className="text-sm flex gap-2 items-center">
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

        {/* USER DROPDOWN */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--hover-soft)]"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--main-gold)] text-black flex items-center justify-center text-sm font-semibold">
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

          {userOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border-soft)]">
                <p className="text-sm">{user?.email}</p>
              </div>

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
                className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
