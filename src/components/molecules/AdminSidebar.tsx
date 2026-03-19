"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FolderOpen,
  Home,
  LayoutDashboard,
  Mail,
  Menu,
  Settings,
  Users,
  Briefcase,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
  { href: "/admin/blogs", label: "Blog Posts", icon: BookOpen },
  { href: "/admin/contacts", label: "Contact Submissions", icon: Mail },
  { href: "/admin/clients", label: "Client Portal", icon: Users },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <Link
          href="/admin"
          className="flex items-center gap-2"
          onClick={closeSidebar}
        >
          <span className="text-xl font-bold tracking-tight">
            Yousief<span className="text-primary">.</span>
          </span>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            Admin
          </span>
        </Link>
        <button
          onClick={closeSidebar}
          className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeSidebar}
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
          onClick={closeSidebar}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          View Website
        </Link>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-64 shrink-0 border-r border-border bg-background z-30">
        {sidebarContent}
      </aside>

      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-[13px] left-4 z-40 p-2 rounded-md bg-background border border-border text-muted-foreground hover:bg-secondary hover:text-foreground shadow-sm transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 h-full w-64 bg-background border-r border-border z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
