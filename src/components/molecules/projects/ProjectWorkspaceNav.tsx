"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "board", label: "Board" },
  { href: "reports", label: "Reports" },
  { href: "activity", label: "Activity" },
  { href: "settings", label: "Settings" },
] as const;

export function ProjectWorkspaceNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/admin/projects/${projectId}`;

  return (
    <nav className="flex flex-wrap gap-1 border-b border-border pb-px">
      {tabs.map((tab) => {
        const href = `${base}/${tab.href}`;
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "rounded-t-md px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border border-border border-b-transparent bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
