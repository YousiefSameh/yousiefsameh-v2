import { useInfiniteQuery } from "@tanstack/react-query";
import { getProjectActivity } from "../api/activity";

export const projectActivityKeys = {
  all: (projectId: string) =>
    ["admin", "projects", projectId, "activity"] as const,
};

/**
 * Fetch project-level activity log entries with infinite scroll pagination.
 * Each page returns 20 entries. `fetchNextPage` loads the next page.
 */
export function useProjectActivity(projectId: string) {
  return useInfiniteQuery({
    queryKey: projectActivityKeys.all(projectId),
    queryFn: ({ pageParam }) =>
      getProjectActivity(projectId, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) return undefined;
      return pagination.hasNextPage ? pagination.page + 1 : undefined;
    },
    enabled: projectId.length > 0,
  });
}
