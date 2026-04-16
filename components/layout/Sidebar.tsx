"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/config/navigation";
import { useAuthStore } from "@/app/modules/auth/store/auth.store";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroup(
  item: any,
): item is { label: string; children: any[]; roles: string[] } {
  return Array.isArray(item.children);
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="w-64 bg-[var(--card-bg)] border-r border-[var(--border-soft)] flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--border-soft)]">
        <h1 className="text-lg font-semibold">Church Admin</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {navigation.map((item) => {
          // ✅ GROUP
          if (isGroup(item)) {
            const allowedGroup = item.roles.some((r) =>
              user?.roles?.includes(r),
            );
            if (!allowedGroup) return null;

            const children = item.children.filter((child) =>
              child.roles.some((r) => user?.roles?.includes(r)),
            );

            if (!children.length) return null;

            return (
              <div key={item.label} className="space-y-1">
                <p className="text-xs px-3 text-[var(--text-secondary)] uppercase tracking-wide">
                  {item.label}
                </p>

                {children.map((child) => {
                  const active = isActivePath(pathname, child.href);

                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 pl-8 rounded-lg text-sm transition-all duration-200
                        ${
                          active
                            ? "bg-[var(--main-gold)] text-black font-medium"
                            : "text-[var(--text-secondary)] hover:bg-[var(--hover-soft)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            );
          }

          // ✅ SINGLE ITEM
          const allowed = item.roles.some((r) => user?.roles?.includes(r));
          if (!allowed) return null;

          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200
                ${
                  active
                    ? "bg-[var(--main-gold)] text-black font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--hover-soft)] hover:text-[var(--text-primary)]"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
