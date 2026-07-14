"use client";

import { TaskWithMeta } from "@/features/admin/tasks/api";
import { TaskPriority, TaskType } from "@/app/generated/prisma/enums";
import { TaskTypeBadge } from "@/components/atoms/TaskTypeBadge";
import { TaskPriorityIcon } from "@/components/atoms/TaskPriorityIcon";
import { InlineEditSelect } from "@/components/molecules/InlineEditSelect";
import { InlineEditDate } from "@/components/molecules/InlineEditDate";
import { LabelSelect } from "@/features/admin/tasks/labels/components";
import { useInlineTaskField } from "@/features/admin/tasks/drawer/hooks/useInlineTaskField";
import { useProjectLabels } from "@/features/admin/tasks/labels/hooks";

const PRIORITY_OPTIONS = Object.values(TaskPriority).map((p) => ({
  value: p,
  label: p.charAt(0) + p.slice(1).toLowerCase(),
}));

const TYPE_OPTIONS = Object.values(TaskType).map((t) => ({
  value: t,
  label: t.charAt(0) + t.slice(1).toLowerCase().replace("_", " "),
}));

interface TaskDetailSidebarProps {
  task: TaskWithMeta;
  projectId: string;
}

export function TaskDetailSidebar({ task, projectId }: TaskDetailSidebarProps) {
  const { data: labelsData } = useProjectLabels(projectId);
  const labels = labelsData?.data ?? [];

  const priority = useInlineTaskField(projectId, task.id, "priority");
  const type = useInlineTaskField(projectId, task.id, "type");
  const dueDate = useInlineTaskField(projectId, task.id, "dueDate");
  const labelIds = useInlineTaskField(projectId, task.id, "labelIds");

  const currentLabelIds = task.labels.map(({ label }) => label.id);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-5">
        {/* Priority */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Priority
          </span>
          <InlineEditSelect
            value={task.priority ?? "LOW"}
            options={PRIORITY_OPTIONS}
            onSave={(v) => priority.updateField(v as TaskPriority)}
            isPending={priority.isPending}
            renderValue={(v) => (
              <div className="flex items-center gap-2 text-sm">
                <TaskPriorityIcon priority={v as TaskPriority} />
                <span className="capitalize">{v.toLowerCase()}</span>
              </div>
            )}
          />
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Type
          </span>
          <InlineEditSelect
            value={task.type ?? "FEATURE"}
            options={TYPE_OPTIONS}
            onSave={(v) => type.updateField(v as TaskType)}
            isPending={type.isPending}
            renderValue={(v) => (
              <TaskTypeBadge type={v as TaskType} size="sm" />
            )}
          />
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Due Date
          </span>
          <InlineEditDate
            value={task.dueDate ? new Date(task.dueDate) : null}
            onSave={(v) => dueDate.updateField(v)}
            isPending={dueDate.isPending}
          />
        </div>

        {/* Assignee — read-only (no member list hook available) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Assignee
          </span>
          <div className="text-sm">
            {task.assigneeId ? (
              <span className="font-mono text-xs">
                {task.assigneeId.slice(0, 8)}
              </span>
            ) : (
              <span className="text-muted-foreground">Unassigned</span>
            )}
          </div>
        </div>

        {/* Labels */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Labels
          </span>

          <LabelSelect
            labels={labels}
            value={currentLabelIds}
            onChange={(ids) => labelIds.updateField(ids)}
            disabled={labelIds.isPending}
          />
        </div>
      </div>
    </div>
  );
}
