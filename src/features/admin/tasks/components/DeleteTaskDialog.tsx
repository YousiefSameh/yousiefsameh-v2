"use client";

import { useState } from "react";
import { Trash, Loader2 } from "lucide-react";
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

interface DeleteTaskDialogProps {
  projectId: string;
  taskId: string;
  taskTitle: string;
}

export function DeleteTaskDialog({ projectId, taskId, taskTitle }: DeleteTaskDialogProps) {
  const [open, setOpen] = useState(false);
  
  const { mutate: deleteTask, isPending } = useDeleteTask(projectId);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();

    deleteTask(taskId, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity"
          onClick={(e) => {
            // منع انتشار الحدث عند الضغط على الأيقونة لفتح الـ Dialog
            e.stopPropagation();
          }}
        >
          <Trash className="size-4" />
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