"use client";

import { useState } from "react";
import { Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteTask } from "@/features/admin/tasks/hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/atoms/alert-dialog";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface DeleteTaskDialogProps {
  projectId: string;
  taskId: string;
  taskTitle: string;
  showText?: boolean;
  onDeleted?: () => void;
}

export function DeleteTaskDialog({ projectId, taskId, taskTitle, showText, onDeleted }: DeleteTaskDialogProps) {
  const [open, setOpen] = useState(false);
  
  const { mutate: deleteTask, isPending } = useDeleteTask(projectId);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();

    deleteTask(taskId, {
      onSuccess: () => {
        toast.success(`Task "${taskTitle}" deleted`);
        setOpen(false);
        onDeleted?.();
      },
      onError: (err) => {
        toast.error(err.message ?? "Failed to delete task");
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size={"sm"}
          className={"text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity gap-1"}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Trash className="size-4" />
          <span>Delete Task</span>
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the task{" "}
            <span className="font-semibold text-foreground">&quot;{taskTitle}&quot;</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}