"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";
import { useLogout } from "@/app/modules/auth/hooks/useLogout";
import { showError, showSuccess } from "@/lib/toast";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
      if (event.key === "Escape") {
        setOpen(false);
      }
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
    <header className="h-16 flex items-center justify-between px-6 bg-[var(--card-bg)] border-b border-[var(--border-soft)]">
      <div />

      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--hover-soft)] transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--main-gold)] text-black flex items-center justify-center text-sm font-medium">
            {user?.email?.[0]?.toUpperCase()}
          </div>

          <span className="text-sm">{user?.email}</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border-soft)] rounded-xl shadow-lg z-10 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3 border-b border-[var(--border-soft)]">
              <div className="w-9 h-9 rounded-full bg-[var(--main-gold)] text-black flex items-center justify-center text-sm font-semibold">
                {user?.email?.[0]?.toUpperCase()}
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-[var(--text-primary)] font-medium">
                  {user?.email}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  Signed in
                </span>
              </div>
            </div>

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
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
