"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FolderOpen,
  Home,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/blog", label: "Blog Posts", icon: BookOpen },
  { href: "/admin/contacts", label: "Contact Submissions", icon: Mail },
  { href: "/admin/clients", label: "Client Portal", icon: Users },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden fixed top-0 left-0 max-h-screen h-full w-64 shrink-0 border-r border-border bg-background lg:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Yousief<span className="text-primary">.</span>
          </span>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          View Website
        </Link>
      </div>
    </aside>
  );
}
