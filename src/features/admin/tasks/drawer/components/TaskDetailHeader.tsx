"use client";

import { TaskWithMeta } from "@/features/admin/tasks/api";
import { TaskStatus } from "@/app/generated/prisma/enums";
import { InlineEditText } from "@/components/molecules/InlineEditText";
import { InlineEditSelect } from "@/components/molecules/InlineEditSelect";
import { TaskStatusBadge } from "@/components/atoms/TaskStatusBadge";
import { useInlineTaskField } from "@/features/admin/tasks/drawer/hooks/useInlineTaskField";

const STATUS_OPTIONS = Object.values(TaskStatus).map((s) => ({
  value: s,
  label: s.replace("_", " "),
}));

interface TaskDetailHeaderProps {
  task: TaskWithMeta;
  projectId: string;
}

export function TaskDetailHeader({
  task,
  projectId,
}: TaskDetailHeaderProps) {
  const title = useInlineTaskField(projectId, task.id, "title");
  const status = useInlineTaskField(projectId, task.id, "status");

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          TSK-{task.id.slice(0, 8)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Inline status badge as a select */}
        <InlineEditSelect
          value={task.status ?? "TODO"}
          options={STATUS_OPTIONS}
          onSave={(v) => status.updateField(v as TaskStatus)}
          isPending={status.isPending}
          renderValue={(v) => (
            <TaskStatusBadge status={v as TaskStatus} size="sm" />
          )}
          className="shrink-0"
        />

        {/* Inline title text edit */}
        <InlineEditText
          value={task.title}
          onSave={(v) => title.updateField(v)}
          isPending={title.isPending}
          placeholder="Task title"
          className="flex-1 text-xl font-semibold"
        />
      </div>
    </div>
  );
}
