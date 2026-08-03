"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Download, Trash2 } from "lucide-react";
import { WeeklyReportAttachment } from "@/app/generated/prisma/client";
import { useDeleteReportAttachment } from "@/features/admin/reports/attachments/hooks";
import { formatBytes, FileIcon } from "../utils";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { cn } from "@/lib/utils";

interface ReportAttachmentItemProps {
  attachment: WeeklyReportAttachment;
  projectId:  string;
  reportId:   string;
}

export function ReportAttachmentItem({
  attachment,
  projectId,
  reportId,
}: ReportAttachmentItemProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { mutate: deleteAttachment, isPending: isDeleting } =
    useDeleteReportAttachment(projectId, reportId);

  const isImage      = attachment.mimeType?.startsWith("image/") ?? false;
  const formattedSize = formatBytes(attachment.sizeBytes);
  const uploadedAt   = formatDistanceToNow(new Date(attachment.createdAt), {
    addSuffix: true,
  });

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-3 rounded-lg border border-border bg-card p-3",
          "transition-colors hover:bg-accent/40",
        )}
      >
        {/* File icon / image thumbnail */}
        <button
          type="button"
          onClick={() => isImage && setLightboxOpen(true)}
          disabled={!isImage}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            "bg-muted text-muted-foreground",
            isImage && "cursor-pointer hover:opacity-80 transition-opacity",
            !isImage && "cursor-default",
          )}
          aria-label={isImage ? `Preview ${attachment.fileName}` : undefined}
        >
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.url}
              alt={attachment.fileName}
              className="size-10 rounded-md object-cover"
            />
          ) : (
            <FileIcon mimeType={attachment.mimeType} className="size-5" />
          )}
        </button>

        {/* Metadata */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium text-foreground"
            title={attachment.fileName}
          >
            {attachment.fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {[formattedSize, uploadedAt].filter(Boolean).join(" · ")}
          </p>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            asChild
            aria-label={`Download ${attachment.fileName}`}
          >
            <a
              href={attachment.url}
              download={attachment.fileName}
              target="_blank"
              rel="noreferrer"
            >
              <Download className="size-4" />
            </a>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
                aria-label={`Delete ${attachment.fileName}`}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner className="size-4" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete attachment?</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-medium">{attachment.fileName}</span>{" "}
                  will be permanently deleted. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteAttachment(attachment.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Image lightbox */}
      {isImage && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{attachment.fileName}</DialogTitle>
            </DialogHeader>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachment.url}
              alt={attachment.fileName}
              className="max-h-[70vh] w-full rounded-md object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}