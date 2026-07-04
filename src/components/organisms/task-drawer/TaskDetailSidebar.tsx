"use client";

import { TaskWithMeta } from "@/features/admin/tasks/api";
import { TaskStatusBadge } from "@/components/atoms/TaskStatusBadge";
import { TaskTypeBadge } from "@/components/atoms/TaskTypeBadge";
import { TaskPriorityIcon } from "@/components/atoms/TaskPriorityIcon";
import { TaskLabelChip } from "@/components/atoms/TaskLabelChip";
import { format } from "date-fns";

interface TaskDetailSidebarProps {
  task: TaskWithMeta;
}

export function TaskDetailSidebar({ task }: TaskDetailSidebarProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
          <div>
            <TaskStatusBadge status={task.status ?? "TODO"} size="md" />
          </div>
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <TaskPriorityIcon priority={task.priority ?? "LOW"} />
            <span className="capitalize">{(task.priority ?? "LOW").toLowerCase()}</span>
          </div>
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</span>
          <div>
            <TaskTypeBadge type={task.type ?? "FEATURE"} size="md" />
          </div>
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</span>
          <div className="text-sm">
            {task.dueDate ? format(task.dueDate, "PPP") : <span className="text-muted-foreground">No due date</span>}
          </div>
        </div>

        {/* Assignee */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assignee</span>
          <div className="text-sm">
            {task.assigneeId ? <span className="font-mono text-xs">{task.assigneeId.slice(0, 8)}</span> : <span className="text-muted-foreground">Unassigned</span>}
          </div>
        </div>

        {/* Labels */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Labels</span>
          <div className="flex flex-wrap gap-1.5">
            {task.labels.length > 0 ? (
              task.labels.map(({ label }) => <TaskLabelChip key={label.id} label={label} />)
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
