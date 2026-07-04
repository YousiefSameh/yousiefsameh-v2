"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useTaskDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const taskId = searchParams.get("taskId");
  const isOpen = !!taskId;

  const open = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("taskId", id);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("taskId");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }, [pathname, router, searchParams]);

  return {
    taskId,
    isOpen,
    open,
    close,
  };
}
