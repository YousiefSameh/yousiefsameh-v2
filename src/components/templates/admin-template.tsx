import type React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/molecules/AdminSidebar";
import { AdminHeader } from "@/components/molecules/AdminHeader";
import { auth } from "@/lib/auth";
import QueryProvider from "./query-provider";

export default async function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  if (!user) {
    redirect("/auth/login");
  }

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
