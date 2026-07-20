"use client";

import { useCallback, useRef, useState } from "react";
import { Paperclip, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  uploadMultipleImages,
  type UploadOptions,
} from "@/lib/upload";
import {
  useTaskAttachments,
  useCreateAttachment,
} from "@/features/admin/tasks/attachments/hooks";
import { TaskAttachmentItem } from "./TaskAttachmentItem";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/atoms/empty";
import { cn } from "@/lib/utils";


/**
 * Broader file-type allowlist for task attachments.
 * Images, PDFs, Office docs, text files, archives, and common code files.
 */
const ATTACHMENT_UPLOAD_OPTIONS: UploadOptions = {
  folder: "task-attachments",
  maxSizeInMB: 20,
  allowedTypes: [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Text / code
    "text/plain",
    "text/csv",
    "text/markdown",
    // Archives
    "application/zip",
    "application/x-zip-compressed",
  ],
};

function AttachmentSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <Skeleton className="size-10 shrink-0 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-48 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </div>
  );
}

interface TaskAttachmentListProps {
  projectId: string;
  taskId: string;
}

export function TaskAttachmentList({ projectId, taskId }: TaskAttachmentListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading } = useTaskAttachments(projectId, taskId);
  const { mutate: createAttachment } = useCreateAttachment(projectId, taskId);

  const attachments = data?.data ?? [];

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      setIsUploading(true);

      try {
        const results = await uploadMultipleImages(files, ATTACHMENT_UPLOAD_OPTIONS);

        let successCount = 0;

        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const file = files[i];

          if (result.error) {
            toast.error(`Failed to upload "${file.name}": ${result.error}`);
            continue;
          }

          // Persist the metadata to the database
          createAttachment(
            {
              url: result.url,
              filePath: result.path,
              fileName: file.name,
              mimeType: file.type || null,
              sizeBytes: file.size || null,
            },
            {
              onError: (err) => {
                toast.error(
                  `Uploaded "${file.name}" but failed to save: ${err.message}`,
                );
              },
            },
          );

          successCount++;
        }

        if (successCount > 0) {
          toast.success(
            successCount === 1
              ? "File attached successfully"
              : `${successCount} files attached successfully`,
          );
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Upload failed. Please try again.",
        );
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [createAttachment],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    void handleFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    void handleFiles(files);
  };


  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone / upload trigger */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload attachments — drag and drop or click to browse"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!isUploading) fileInputRef.current?.click();
          }
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed",
          "p-6 text-center transition-colors cursor-pointer",
          "hover:border-primary/50 hover:bg-accent/30",
          isDragOver && "border-primary bg-primary/5",
          isUploading && "cursor-not-allowed opacity-60 pointer-events-none",
        )}
      >
        {isUploading ? (
          <>
            <Spinner className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className="size-6 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-medium">
                {isDragOver ? "Drop files here" : "Drag & drop or click to attach"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Images, PDFs, docs, archives — up to 20 MB each
              </p>
            </div>
          </>
        )}
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleInputChange}
        accept={ATTACHMENT_UPLOAD_OPTIONS.allowedTypes?.join(",")}
      />

      {/* Attach button — secondary trigger for keyboard/screen-reader users */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Browse files to attach"
      >
        {isUploading ? (
          <Spinner className="mr-2 size-4" />
        ) : (
          <Paperclip className="mr-2 size-4" aria-hidden />
        )}
        {isUploading ? "Uploading…" : "Attach files"}
      </Button>

      {/* Attachment list */}
      {isLoading ? (
        <div className="flex flex-col gap-2" aria-label="Loading attachments" aria-busy="true">
          <AttachmentSkeleton />
          <AttachmentSkeleton />
          <AttachmentSkeleton />
        </div>
      ) : attachments.length === 0 ? (
        <Empty className="border-dashed py-8">
          <EmptyHeader>
            <EmptyMedia>
              <Paperclip className="size-8 text-muted-foreground" aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No attachments yet</EmptyTitle>
            <EmptyDescription>
              Upload files to share context with your team.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-label="Task attachments">
          {attachments.map((attachment) => (
            <div key={attachment.id} role="listitem">
              <TaskAttachmentItem
                attachment={attachment}
                projectId={projectId}
                taskId={taskId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}