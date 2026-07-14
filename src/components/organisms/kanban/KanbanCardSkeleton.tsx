import { Skeleton } from "@/components/atoms/skeleton";
import { cn } from "@/lib/utils";

const TITLE_WIDTHS: [string, string][] = [
  ["w-full", "w-3/4"], // instance 0
  ["w-11/12", "w-1/2"], // instance 1
  ["w-5/6", "w-2/3"], // instance 2
];

interface KanbanCardSkeletonProps {
  index?: number;
  className?: string;
}

/**
 * A shimmer placeholder for a KanbanCard.
 *
 * The layout mirrors KanbanCard exactly:
 *   Row 1 — priority icon + type label
 *   Row 2 — title line 1
 *   Row 3 — title line 2 (shorter)
 *   Row 4 — label chips
 *   Row 5 — due date + count badges
 *
 * Rendered by KanbanColumn while useAdminTasks is loading.
 */
export function KanbanCardSkeleton({
  index = 0,
  className,
}: KanbanCardSkeletonProps) {
  const [titleW1, titleW2] = TITLE_WIDTHS[index % TITLE_WIDTHS.length];

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 lg:w-62 w-full rounded-lg border bg-card p-3",
        className,
      )}
      aria-hidden="true"
    >
      {/* Row 1: priority icon + type */}
      <div className="flex items-center justify-between">
        <Skeleton className="size-3.5 rounded-full" />
        <Skeleton className="h-3 w-12 rounded" />
      </div>

      {/* Row 2 + 3: title */}
      <Skeleton className={cn("h-4 rounded", titleW1)} />
      <Skeleton className={cn("h-4 rounded", titleW2)} />

      {/* Row 4: label chips */}
      <div className="flex gap-1">
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-4 w-10 rounded-full" />
      </div>

      {/* Row 5: due date + counts */}
      <div className="flex items-center justify-between pt-0.5">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-10 rounded" />
      </div>
    </div>
  );
}
