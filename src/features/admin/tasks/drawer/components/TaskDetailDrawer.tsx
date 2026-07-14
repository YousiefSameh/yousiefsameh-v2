"use client";

import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/atoms/dialog";
import { useTaskDrawer } from "@/features/admin/tasks/drawer/hooks/useTaskDrawer";
import { useAdminTask } from "@/features/admin/tasks/hooks";
import { TaskDetailHeader } from "./TaskDetailHeader";
import { TaskDetailSidebar } from "./TaskDetailSidebar";
import { TaskDetailBody } from "./TaskDetailBody";

interface TaskDetailDrawerProps {
  projectId: string;
}

export function TaskDetailDrawer({ projectId }: TaskDetailDrawerProps) {
  const { isOpen, taskId, close, open } = useTaskDrawer();

  const { data: taskResponse, isLoading, isError } = useAdminTask(projectId, taskId ?? "");
  const task = taskResponse?.data;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-7xl! h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-background" aria-describedby="task-detail-description">
        <DialogTitle className="sr-only">Task Details</DialogTitle>
        <DialogDescription id="task-detail-description" className="sr-only">
          Detailed view and editing interface for the selected task.
        </DialogDescription>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError || (!task && taskId) ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Task not found or failed to load.
          </div>
        ) : task ? (
          <>
            <TaskDetailHeader task={task} projectId={projectId} />
            <div className="flex flex-1 overflow-hidden">
              <TaskDetailBody
                task={task}
                projectId={projectId}
                onOpenTask={open}
              />
              <div className="w-[340px] shrink-0 border-l border-border bg-muted/10 overflow-y-auto">
                <TaskDetailSidebar task={task} projectId={projectId} />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
