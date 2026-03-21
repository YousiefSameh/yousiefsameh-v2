"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/molecules/AdminSidebar";
import { AdminHeader } from "@/components/molecules/AdminHeader";
import QueryProvider from "./query-provider";
import { authClient } from "@/lib/auth-client";

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (!isPending && !user) {
      router.push("/auth/login");
    }
  }, [isPending, user, router]);

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-secondary/30 text-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader user={user} />
        <main className="flex-1 p-6 ml-0 lg:ml-64">
          <QueryProvider>{children}</QueryProvider>
        </main>
      </div>
    </div>
  );
}