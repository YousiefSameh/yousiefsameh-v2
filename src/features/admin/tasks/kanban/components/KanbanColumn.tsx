"use client";

import { forwardRef } from "react";
import type { ReactNode } from "react";
import { TaskStatus } from "@/app/generated/prisma/client";
import { TaskWithMeta } from "@/features/admin/tasks/api";
import { KanbanColumnHeader } from "./KanbanColumnHeader";
import { KanbanCard } from "./KanbanCard";
import { KanbanCardSkeleton } from "./KanbanCardSkeleton";
import { cn } from "@/lib/utils";

const SKELETON_COUNT = 3;

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TaskWithMeta[];
  isLoading?: boolean;
  isOver?: boolean;
  onAddTask?: (status: TaskStatus) => void;
  onCardClick?: (task: TaskWithMeta) => void;
  renderCard?: (task: TaskWithMeta, index: number) => ReactNode;
  className?: string;
  projectId: string;
}

/**
 * A single Kanban column.
 *
 * Structure:
 *   [outer column shell]        ← group/column, background, border highlight
 *     KanbanColumnHeader        ← dot · label · count · add button
 *     [inner card list div]     ← ref target, scrollable, min-height
 *       KanbanCardSkeleton × N  ← while loading
 *       empty state div         ← when tasks.length === 0 and not loading
 *       KanbanCard × N          ← default renderer (no DnD)
 *       renderCard(task) × N    ← DnD-wrapped renderer (Commit 6)
 *
 */
export const KanbanColumn = forwardRef<HTMLDivElement, KanbanColumnProps>(
  (
    {
      status,
      tasks,
      isLoading = false,
      isOver = false,
      onAddTask,
      onCardClick,
      renderCard,
      className,
      projectId
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "group/column flex lg:w-68 w-full shrink-0 flex-col rounded-xl p-2",
          "border border-transparent bg-muted/40",
          "transition-colors duration-150",
          isOver && "border-primary/30 bg-primary/5",
          className,
        )}
      >
        <KanbanColumnHeader
          status={status}
          count={tasks.length}
          onAddTask={onAddTask}
          isOver={isOver}
        />

        {/* Card list */}
        <div
          ref={ref}
          className={cn(
            "flex flex-1 flex-col gap-2 overflow-y-auto",
            "min-h-24",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
          )}
        >
          {isLoading ? (
            // Skeleton state
            Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <KanbanCardSkeleton key={i} index={i} />
            ))
          ) : tasks.length === 0 ? (
            // Empty state
            <div
              className={cn(
                "flex h-full min-h-24 items-center justify-center rounded-lg",
                "border border-dashed border-border/50",
                "text-[12px] text-muted-foreground",
                "transition-colors duration-150",
                isOver && "border-primary/50 bg-primary/5 text-primary/70",
              )}
            >
              Drop here
            </div>
          ) : renderCard ? (
            // DnD-wrapped renderer
            tasks.map((task, index) => renderCard(task, index))
          ) : (
            // Default static renderer
            tasks.map((task) => (
              <KanbanCard projectId={projectId} key={task.id} task={task} onClick={onCardClick} />
            ))
          )}
        </div>
      </div>
    );
  },
);

KanbanColumn.displayName = "KanbanColumn";
