"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Dialog } from "@/components/ui/Dialog";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) setNavigationOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--bg-dark)] font-sans text-[var(--text-primary)]">
      <a href="#portal-content" className="sr-only z-50 rounded-lg bg-[var(--card-bg)] p-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4">Skip to content</a>
      <div className="hidden w-64 shrink-0 lg:block">
        <Sidebar key={pathname} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar key={pathname} onOpenNavigation={() => setNavigationOpen(true)} navigationOpen={navigationOpen} />
        <main id="portal-content" tabIndex={-1} className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full min-w-0 max-w-screen-2xl">{children}</div>
        </main>
      </div>
      <Dialog open={navigationOpen} onClose={() => setNavigationOpen(false)} title="Church portal" variant="drawer">
        <Sidebar key={pathname} onNavigate={() => setNavigationOpen(false)} showBrand={false} />
      </Dialog>
    </div>
  );
}
