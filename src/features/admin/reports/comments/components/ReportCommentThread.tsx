"use client";

import { useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { type JSONContent } from "@tiptap/core";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CornerDownRight, Pencil, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { WeeklyReportComment } from "@/app/generated/prisma/client";
import {
  useReportComments,
  useCreateReportComment,
  useUpdateReportComment,
  useDeleteReportComment,
} from "@/features/admin/reports/comments/hooks";
import { ReportCommentWithReplies } from "@/features/admin/reports/comments/api";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
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
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/atoms/empty";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateHTML } from "@tiptap/html";

// Helpers

const EXTENSIONS = [StarterKit];
const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function isEmptyDoc(json: JSONContent): boolean {
  const text = json?.content
    ?.flatMap((n) => n.content ?? [])
    .map((n) => n.text ?? "")
    .join("");
  return !text?.trim();
}

function renderBody(body: unknown): string {
  try {
    return generateHTML(body as JSONContent, EXTENSIONS);
  } catch {
    return String(body ?? "");
  }
}

// Minimal TipTap composer

interface ComposerProps {
  onSubmit: (body: JSONContent) => void;
  isPending: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  beforeEditedValue?: string;
  isEditing?: boolean;
  onCancel?: () => void;
}

function Composer({
  onSubmit,
  isPending,
  placeholder = "Write a comment…",
  autoFocus = false,
  beforeEditedValue,
  isEditing = false,
  onCancel,
}: ComposerProps) {
  const editor = useEditor({
    extensions: EXTENSIONS,
    content: beforeEditedValue ? JSON.parse(beforeEditedValue) : EMPTY_DOC,
    immediatelyRender: false,
    autofocus: autoFocus ? "end" : false,
    editorProps: {
      attributes: {
        class:
          "min-h-[80px] p-3 text-sm focus:outline-none prose prose-sm dark:prose-invert !max-w-none",
        "data-placeholder": placeholder,
      },
    },
  });

  function handleSubmit() {
    if (!editor) return;
    const json = editor.getJSON();
    if (isEmptyDoc(json)) return;
    onSubmit(json);
    editor.commands.setContent(EMPTY_DOC);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onKeyDown={handleKeyDown}
        className="rounded-md border border-border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring"
      >
        <EditorContent editor={editor} />
      </div>
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <Spinner className="mr-2 size-3.5" />
          ) : (
            <Send className="mr-2 size-3.5" />
          )}
          {isEditing ? "Save" : onCancel ? "Reply" : "Comment"}
        </Button>
      </div>
    </div>
  );
}

// Single comment item

interface CommentItemProps {
  comment: WeeklyReportComment & { replies?: WeeklyReportComment[] };
  projectId: string;
  reportId: string;
  isReply?: boolean;
}

function CommentItem({
  comment,
  projectId,
  reportId,
  isReply = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const editEditorRef = useRef<ReturnType<typeof useEditor>>(null);

  const { mutate: updateComment, isPending: isUpdating } =
    useUpdateReportComment(projectId, reportId);
  const { mutate: deleteComment, isPending: isDeleting } =
    useDeleteReportComment(projectId, reportId);
  const { mutate: createComment, isPending: isCreating } =
    useCreateReportComment(projectId, reportId);

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });
  const wasEdited =
    new Date(comment.updatedAt).getTime() !==
    new Date(comment.createdAt).getTime();

  function handleUpdate(body: JSONContent) {
    updateComment(
      { commentId: comment.id, body },
      {
        onSuccess: () => setIsEditing(false),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleDelete() {
    deleteComment(comment.id, {
      onError: (err) => toast.error(err.message),
    });
  }

  function handleReply(body: JSONContent) {
    createComment(
      { body, parentId: comment.id },
      {
        onSuccess: () => setIsReplying(false),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isReply && "ml-6 border-l border-border pl-4",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-[10px]">
          A
        </span>
        <span className="font-medium text-foreground text-sm">Admin</span>
        <span>{timeAgo}</span>
        {wasEdited && <span className="italic">(edited)</span>}
      </div>

      {/* Body */}
      {isEditing ? (
        <Composer
          onSubmit={handleUpdate}
          isPending={isUpdating}
          onCancel={() => setIsEditing(false)}
          beforeEditedValue={JSON.stringify(comment.body)}
          isEditing={isEditing}
          autoFocus
        />
      ) : (
        <div
          className="prose prose-sm dark:prose-invert !max-w-none text-sm pl-8"
          dangerouslySetInnerHTML={{ __html: renderBody(comment.body) }}
        />
      )}

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center gap-1 pl-8">
          {!isReply && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={() => setIsReplying((v) => !v)}
            >
              <CornerDownRight className="mr-1 size-3" />
              Reply
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="mr-1 size-3" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner className="size-3" />
                ) : (
                  <Trash2 className="mr-1 size-3" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                <AlertDialogDescription>
                  This comment will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Reply composer */}
      {isReplying && (
        <div className="pl-8 pt-1">
          <Composer
            onSubmit={handleReply}
            isPending={isCreating}
            placeholder="Write a reply…"
            onCancel={() => setIsReplying(false)}
            autoFocus
          />
        </div>
      )}

      {/* Nested replies */}
      {"replies" in comment &&
        Array.isArray(comment.replies) &&
        comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            projectId={projectId}
            reportId={reportId}
            isReply
          />
        ))}
    </div>
  );
}

// Loading skeleton

function CommentSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="ml-8 h-10 w-full rounded-md" />
    </div>
  );
}

// Main component

interface ReportCommentThreadProps {
  projectId: string;
  reportId: string;
}

export function ReportCommentThread({
  projectId,
  reportId,
}: ReportCommentThreadProps) {
  const { data, isLoading } = useReportComments(projectId, reportId);
  const { mutate: createComment, isPending: isCreating } =
    useCreateReportComment(projectId, reportId);

  const comments = data?.data ?? [];

  function handleCreate(body: JSONContent) {
    createComment({ body }, { onError: (err) => toast.error(err.message) });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Comment list */}
      {isLoading ? (
        <div className="flex flex-col gap-6" aria-busy="true">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      ) : comments.length === 0 ? (
        <Empty className="border-dashed py-8">
          <EmptyHeader>
            <EmptyMedia>
              <MessageSquare
                className="size-8 text-muted-foreground"
                aria-hidden
              />
            </EmptyMedia>
            <EmptyTitle>No comments yet</EmptyTitle>
            <EmptyDescription>Start the conversation.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div
          className="flex flex-col gap-6"
          role="list"
          aria-label="Report comments"
        >
          {comments.map((comment: ReportCommentWithReplies) => (
            <div key={comment.id} role="listitem">
              <CommentItem
                comment={comment}
                projectId={projectId}
                reportId={reportId}
              />
            </div>
          ))}
        </div>
      )}

      {/* New comment composer — always visible at the bottom */}
      <div className="border-t border-border pt-4">
        <Composer onSubmit={handleCreate} isPending={isCreating} />
      </div>
    </div>
  );
}
