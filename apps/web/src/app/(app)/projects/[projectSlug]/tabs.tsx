"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface ProjectTabsProps {
  projectSlug: string;
}

export function ProjectTabs({ projectSlug }: ProjectTabsProps) {
  const pathname = usePathname();
  const base = `/projects/${projectSlug}`;

  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/suites`, label: "Eval suites" },
    { href: `${base}/settings`, label: "Settings" },
  ];

  return (
    <nav className="-mb-px mt-4 flex gap-6">
      {tabs.map((t) => {
        const active =
          t.href === base ? pathname === base : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "border-b-2 pb-3 text-sm transition-colors",
              active
                ? "border-white text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
