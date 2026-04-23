"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const items = [
  { href: "/dashboard", label: "總覽" },
  { href: "/campaigns", label: "頁配案件" },
  { href: "/campaigns/new", label: "新增案件" },
  { href: "/calendar", label: "行事曆" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-black/[0.06] min-h-screen flex flex-col">
      <div className="px-6 pt-7 pb-6">
        <div className="text-[15px] font-semibold tracking-tightsb text-ink">
          頁配管家
        </div>
        <div className="text-[11px] text-ink-mute mt-0.5">
          Campaign Manager
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {items.map((it) => {
          const active =
            it.href === "/campaigns"
              ? pathname === "/campaigns"
              : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block px-3 py-2 rounded-lg text-[13px] transition ${
                active
                  ? "bg-ceramic text-ink font-semibold"
                  : "text-ink-soft hover:text-ink hover:bg-ceramic/60"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 pt-4">
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
  );
}
