import { useInfiniteQuery } from "@tanstack/react-query";
import { getTaskActivity } from "../api";

export const activityKeys = {
  all: (projectId: string, taskId: string) =>
    ["admin", "projects", projectId, "tasks", taskId, "activity"] as const,
};

/**
 * Fetch activity log entries for a task with infinite scroll pagination.
 * Each page returns 20 entries (the API default). `fetchNextPage` loads the
 * next 20. Enabled only when both IDs are non-empty.
 */
export function useTaskActivity(projectId: string, taskId: string) {
  return useInfiniteQuery({
    queryKey: activityKeys.all(projectId, taskId),
    queryFn: ({ pageParam }) =>
      getTaskActivity(projectId, taskId, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) return undefined;
      return pagination.hasNextPage ? pagination.page + 1 : undefined;
    },
    enabled: projectId.length > 0 && taskId.length > 0,
  });
}