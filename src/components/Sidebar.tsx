"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const items = [
  { href: "/dashboard", label: "總覽" },
  { href: "/campaigns", label: "頁配案件" },
  { href: "/campaigns/new", label: "新增案件" },
  { href: "/calendar", label: "行事曆" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer whenever route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const active = (href: string) =>
    href === "/campaigns" ? pathname === "/campaigns" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar — only on <md */}
      <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-black/[0.06] flex items-center justify-between px-4 h-14">
        <div className="text-[15px] font-semibold tracking-tightsb text-ink">
          頁配管家
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 -mr-2 text-ink"
          aria-label="開啟選單"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </header>

      {/* Scrim (mobile only) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile drawer */}
      <aside
        className={`w-60 md:w-56 shrink-0 bg-white border-r border-black/[0.06] flex flex-col
          fixed md:sticky top-0 left-0 h-screen z-50 md:z-auto
          transform transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header (desktop only — mobile has the top bar) */}
        <div className="px-6 pt-7 pb-6 flex items-center justify-between">
          <div>
            <div className="text-[15px] font-semibold tracking-tightsb text-ink">
              頁配管家
            </div>
            <div className="text-[11px] text-ink-mute mt-0.5">Campaign Manager</div>
          </div>
          {/* Close button visible only on mobile */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-2 -mr-2 text-ink-soft hover:text-ink"
            aria-label="關閉選單"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`block px-3 py-2.5 rounded-lg text-[14px] md:text-[13px] transition ${
                active(it.href)
                  ? "bg-ceramic text-ink font-semibold"
                  : "text-ink-soft hover:text-ink hover:bg-ceramic/60"
              }`}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-6 pt-4 border-t border-black/[0.04] mx-3">
          <div className="px-3 py-2 text-[12px]">
            <div className="text-ink-mute">登入者</div>
            <div className="text-ink font-medium truncate mt-0.5">{userName}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full mt-0.5 px-3 py-2 text-[12px] text-ink-soft hover:text-ink hover:bg-ceramic/60 rounded-lg text-left transition"
          >
            登出
          </button>
        </div>
      </aside>
    </>
  );
}
