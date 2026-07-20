"use client";

import { TaskStatus } from "@/app/generated/prisma/client";
import { KANBAN_COLUMN_LABELS, KANBAN_COLUMN_COLORS } from "@/lib/kanban/constants";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface KanbanColumnHeaderProps {
  status: TaskStatus;
  count: number;
  onAddTask?: (status: TaskStatus) => void;
  isOver?: boolean;
}

/**
 * Column header row: accent dot · status label · task count · add button.
 *
 * This is a "use client" component because the add-task button has an onClick handler. It has no internal state — all data flows in as props.
 */
export function KanbanColumnHeader({
  status,
  count,
  onAddTask,
  isOver,
}: KanbanColumnHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-1 pb-2",
        "transition-opacity duration-150",
        isOver && "opacity-75",
      )}
    >
      {/* Left side: dot · label · count */}
      <div className="flex items-center gap-2">
        {/* Accent dot */}
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            KANBAN_COLUMN_COLORS[status],
          )}
          aria-hidden="true"
        />

        <span className="text-sm font-semibold tracking-tight">
          {KANBAN_COLUMN_LABELS[status]}
        </span>

        {/* Count badge */}
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>

      {/* Right side */}
      {onAddTask && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-6",
            "opacity-0 transition-opacity duration-150",
            "group-hover/column:opacity-100",
            "group-focus-within/column:opacity-100",
          )}
          onClick={() => onAddTask(status)}
          aria-label={`Add task to ${KANBAN_COLUMN_LABELS[status]}`}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
