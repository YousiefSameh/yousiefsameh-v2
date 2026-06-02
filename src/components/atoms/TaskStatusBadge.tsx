import { TaskStatus } from "@/app/generated/prisma/client";
import { KANBAN_COLUMN_COLORS, KANBAN_COLUMN_LABELS } from "@/lib/kanban/constants";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md";
  className?: string;
}

export function TaskStatusBadge({
  status,
  size = "sm",
  className,
}: TaskStatusBadgeProps) {
  const dotColorClass = KANBAN_COLUMN_COLORS[status];
  const label = KANBAN_COLUMN_LABELS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className
      )}
      title={label}
    >
      <span
        className={cn(
          "rounded-full mr-1.5",
          dotColorClass,
          size === "sm" ? "size-1.5" : "size-2"
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
