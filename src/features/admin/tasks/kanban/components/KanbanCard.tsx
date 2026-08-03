"use client";

import { forwardRef } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { TaskWithMeta } from "@/features/admin/tasks/api";
import { TaskPriorityIcon } from "@/components/atoms/TaskPriorityIcon";
import { TaskLabelChip } from "@/components/atoms/TaskLabelChip";
import { TaskCountBadge } from "@/components/atoms/TaskCountBadge";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_LABELS = 3;
const TERMINAL_STATUSES = new Set(["REVIEW", "DONE"] as const);

interface KanbanCardProps {
  task: TaskWithMeta;
  onClick?: (task: TaskWithMeta) => void;
  isOverlay?: boolean;
  isDragging?: boolean;
  className?: string;
}

export const KanbanCard = forwardRef<HTMLDivElement, KanbanCardProps>(
  (
    { task, onClick, isOverlay = false, isDragging = false, className },
    ref,
  ) => {
    const isOverdue =
      !!task.dueDate &&
      task.dueDate < new Date() &&
      !TERMINAL_STATUSES.has(task.status as "REVIEW" | "DONE");

    const hiddenLabelCount = Math.max(
      0,
      task.labels.length - MAX_VISIBLE_LABELS,
    );

    function handleClick() {
      if (isDragging) return;
      onClick?.(task);
    }

    return (
      <div
        ref={ref}
        onClick={handleClick}
        data-task-id={task.id}
        className={cn(
          // Base
          "group relative flex flex-col gap-2.5 rounded-lg border",
          "bg-card lg:w-62 w-full p-3 text-card-foreground shadow-sm",
          // Interaction
          "cursor-grab select-none outline-none",
          "transition-all duration-150",
          "hover:border-border/80 hover:shadow-md",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          // Overlay: card following the cursor
          isOverlay && [
            "rotate-1 scale-105 cursor-grabbing",
            "shadow-2xl ring-2 ring-primary/20",
          ],
          // Ghost: original slot in the source column during drag
          isDragging && "opacity-40 border-dashed shadow-none",
          className,
        )}
      >
        {/* Row 1: Priority + Task type + Delete Button */}
        <div className="flex items-center justify-between gap-2">
          <TaskPriorityIcon priority={task.priority} showLabel />
          
          <div className="flex items-center gap-1.5 ml-auto">
            {task.type && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {task.type.replaceAll("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Title */}
        <p className="line-clamp-2 text-sm font-medium leading-snug">
          {task.title}
        </p>

        {/* Row 3: Labels (conditional) */}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {task.labels.slice(0, MAX_VISIBLE_LABELS).map(({ label }) => (
              <TaskLabelChip key={label.id} label={label} />
            ))}
            {hiddenLabelCount > 0 && (
              <span
                className="text-[10px] text-muted-foreground"
                title={`${hiddenLabelCount} more label${hiddenLabelCount !== 1 ? "s" : ""}`}
              >
                +{hiddenLabelCount}
              </span>
            )}
          </div>
        )}

        {/* Row 4: Footer — due date + counts */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {task.dueDate ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px]",
                isOverdue
                  ? "font-medium text-red-500"
                  : "text-muted-foreground",
              )}
            >
              <CalendarDays className="size-3 shrink-0" aria-hidden="true" />
              {format(task.dueDate, "MMM d")}
            </span>
          ) : (
            <span />
          )}

          <TaskCountBadge
            comments={task._count.comments}
            attachments={task._count.attachments}
          />
        </div>
      </div>
    );
  },
);

KanbanCard.displayName = "KanbanCard";