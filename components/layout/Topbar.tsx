"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { useLogout } from "@/app/modules/auth/hooks/useLogout";
import { showError, showSuccess } from "@/lib/toast";
import { getHighestRole, hasRequiredRole } from "@/lib/auth/roles";
import { useAttentionNotifications } from "@/app/modules/attention/hooks/useAttentionNotifications";
import { FaPeoplePulling } from "react-icons/fa6";
import { GiPrayer } from "react-icons/gi";

export function Topbar({
  onOpenNavigation,
  navigationOpen = false,
}: {
  onOpenNavigation: () => void;
  navigationOpen?: boolean;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useLogout();
  const canManageAttention = hasRequiredRole(user?.roles ?? [], ["DEACON"]);
  const { prayers, visitors, counts, isLoading, isError } = useAttentionNotifications(canManageAttention);
  const [openPanel, setOpenPanel] = useState<"attention" | "account" | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const attentionId = useId();
  const accountId = useId();
  const primaryRole = getHighestRole(user?.roles ?? []);
  const segment = pathname.split("/").filter(Boolean)[1];
  const pageTitle = segment
    ? segment.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    : "Dashboard";

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!controlsRef.current?.contains(event.target as Node)) setOpenPanel(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && openPanel) {
        setOpenPanel(null);
        lastTrigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openPanel]);

  function togglePanel(panel: "attention" | "account", trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    setOpenPanel((current) => current === panel ? null : panel);
  }

  return (
    <header className="relative z-30 flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-[var(--border-soft)] bg-[var(--card-bg)] px-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" onClick={() => { setOpenPanel(null); onOpenNavigation(); }} aria-label="Open portal navigation" aria-haspopup="dialog" aria-expanded={navigationOpen} className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-[var(--hover-soft)] lg:hidden">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <p className="truncate text-sm font-semibold">{pageTitle}</p>
      </div>

      <div ref={controlsRef} className="flex shrink-0 items-center gap-1 sm:gap-2">
        {canManageAttention && (
          <div className="relative flex items-center">
            {[
              { name: "Prayer requests", count: counts.prayers, Icon: GiPrayer },
              { name: "Visitors", count: counts.visitors, Icon: FaPeoplePulling },
            ].map(({ name, count, Icon }) => (
              <button key={name} type="button" onClick={(event) => togglePanel("attention", event.currentTarget)} aria-label={name + ": " + count + " pending"} aria-expanded={openPanel === "attention"} aria-controls={attentionId} className="relative flex size-11 items-center justify-center rounded-lg hover:bg-[var(--hover-soft)]">
                <Icon aria-hidden="true" className="text-lg" />
                {count > 0 && <span aria-hidden="true" className="absolute right-0 top-0 flex min-w-4 items-center justify-center rounded-full bg-[#7c3d0f] px-1 text-[10px] leading-4 text-white">{count > 99 ? "99+" : count}</span>}
              </button>
            ))}
            {openPanel === "attention" && (
              <section id={attentionId} aria-label="Attention center" className="fixed inset-x-4 top-18 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-w-[calc(100vw-2rem)]">
                <h2 className="border-b border-[var(--border-soft)] px-4 py-3 text-sm font-semibold">Attention center</h2>
                {isLoading ? <p role="status" className="p-4 text-sm">Loading notifications…</p> : isError ? <p role="alert" className="p-4 text-sm text-red-700">Notifications could not be loaded. Open the attention center to try again.</p> : (
                  <div className="divide-y divide-[var(--border-soft)]">
                    {[
                      { title: "Prayer requests", entries: prayers, href: "/dashboard/attention/prayers" },
                      { title: "Visitors", entries: visitors, href: "/dashboard/attention/visitors" },
                    ].map(({ title, entries, href }) => (
                      <div key={title} className="py-2">
                        <h3 className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]">{title}</h3>
                        {entries.length === 0 && <p className="px-4 py-2 text-sm text-[var(--text-secondary)]">Nothing pending</p>}
                        {entries.slice(0, 5).map((entry) => <Link key={entry.id} href={href} onClick={() => setOpenPanel(null)} className="block min-h-11 px-4 py-3 text-sm wrap-break-word hover:bg-[var(--hover-soft)]">{entry.name || "Anonymous"}</Link>)}
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/dashboard/attention" onClick={() => setOpenPanel(null)} className="block border-t border-[var(--border-soft)] px-4 py-3 text-center text-sm font-semibold hover:bg-[var(--hover-soft)]">Open attention center →</Link>
              </section>
            )}
          </div>
        )}

        <div className="relative">
          <button type="button" onClick={(event) => togglePanel("account", event.currentTarget)} aria-label="Account options" aria-expanded={openPanel === "account"} aria-controls={accountId} className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-1 hover:bg-[var(--hover-soft)] sm:px-3">
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--main-gold)] text-sm font-semibold text-black">{user?.email?.[0]?.toUpperCase() ?? "?"}</span>
            <span className="hidden min-w-0 max-w-40 text-left sm:block lg:max-w-56">
              <span className="block truncate text-sm">{user?.email}</span>
              {primaryRole && <span className="block text-xs text-[var(--text-secondary)]">{primaryRole}</span>}
            </span>
          </button>
          {openPanel === "account" && (
            <section id={accountId} aria-label="Account options" className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--card-bg)] shadow-xl">
              <p className="border-b border-[var(--border-soft)] px-4 py-3 text-sm wrap-anywhere">{user?.email}</p>
              <Link href="/dashboard/settings/change-password" onClick={() => setOpenPanel(null)} className="block min-h-11 px-4 py-3 text-sm hover:bg-[var(--hover-soft)]">Change password</Link>
              <Link href="/" className="block min-h-11 px-4 py-3 text-sm hover:bg-[var(--hover-soft)]">View church website</Link>
              <button type="button" disabled={logout.isPending} onClick={() => logout.mutate(undefined, {
                onSuccess: () => {
                  showSuccess("Logged out successfully");
                  setUser(null);
                  window.location.href = "/login";
                },
                onError: () => showError("Logout failed"),
              })} className="min-h-11 w-full px-4 py-3 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50">{logout.isPending ? "Signing out…" : "Sign out"}</button>
            </section>
          )}
        </div>
      </div>
    </header>
  );
}
