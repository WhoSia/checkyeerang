"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "출석체크" },
  { href: "/admin", label: "출석관리" },
  { href: "/member", label: "부원관리" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="주 메뉴"
      className="flex w-full max-w-md gap-1 rounded-2xl border border-line bg-surface p-1 shadow-[var(--shadow)]"
    >
      {LINKS.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 text-center font-semibold transition-colors ${
              active ? "bg-brand text-[var(--on-brand)]" : "text-muted hover:bg-brand-soft hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
