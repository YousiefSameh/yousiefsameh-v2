"use client";

import { TaskWithMeta } from "@/features/admin/tasks/api";
import { TaskDetailTabs } from "./TaskDetailTabs";

interface TaskDetailBodyProps {
  task: TaskWithMeta;
}

export function TaskDetailBody({ task }: TaskDetailBodyProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl w-full mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">{task.title}</h2>
            
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground min-h-[100px]">
              {task.description ? (
                <p>{task.description}</p>
              ) : (
                <p className="italic">No description provided.</p>
              )}
            </div>
          </div>
          
          <div className="pt-6">
            <TaskDetailTabs task={task} />
          </div>
        </div>
      </div>
    </div>
  );
}
