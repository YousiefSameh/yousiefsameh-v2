"use client";

import { X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { TaskWithMeta } from "@/features/admin/tasks/api";

interface TaskDetailHeaderProps {
  task: TaskWithMeta;
  onClose: () => void;
}

export function TaskDetailHeader({ task, onClose }: TaskDetailHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          TSK-{task.id.slice(0, 8)}
        </span>
      </div>
    </div>
  );
}
