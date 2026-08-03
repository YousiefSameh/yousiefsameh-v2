"use client";

import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteReport } from "@/features/admin/reports/hooks";
import { Button } from "@/components/atoms/button";
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

interface DeleteReportButtonProps {
  projectId: string;
  reportId:  string;
  onDeleted?: () => void;
  fullWidth?: boolean;
}

export function DeleteReportButton({
  projectId,
  reportId,
  onDeleted,
  fullWidth = false,
}: DeleteReportButtonProps) {
  const { mutate: deleteReport, isPending } = useDeleteReport(projectId);

  function handleDelete() {
    deleteReport(reportId, {
      onSuccess: () => {
        toast.success("Report deleted");
        onDeleted?.();
      },
      onError:   (err) => toast.error(err.message),
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={fullWidth ? "destructive" : "ghost"}
          size={fullWidth ? "default" : "icon"}
          className={fullWidth ? "w-full gap-2" : "text-destructive hover:text-destructive"}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {fullWidth && <span className="hidden lg:inline">Deleting...</span>}
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              {fullWidth && <span className="hidden lg:inline">Delete Report</span>}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete report?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the report along with all its comments
            and attachments. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}