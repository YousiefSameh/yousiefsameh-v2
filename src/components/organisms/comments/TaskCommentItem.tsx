"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash2, CornerDownRight } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import type { TaskComment } from "@/app/generated/prisma/client";
import { RenderDescription } from "@/components/molecules/rich-text-editor/RenderDescription";
import { Button } from "@/components/atoms/button";
import { useDeleteComment } from "@/features/admin/tasks/comments/hooks";
import { TaskCommentInput } from "./TaskCommentInput";

interface TaskCommentItemProps {
  comment: TaskComment;
  projectId: string;
  taskId: string;
  /** Replies to this comment (only one level deep) */
  replies?: TaskComment[];
}

export function TaskCommentItem({
  comment,
  projectId,
  taskId,
  replies = [],
}: TaskCommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(
    projectId,
    taskId,
  );

  const isDeleted = comment.deletedAt !== null;

  if (isDeleted) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs text-muted-foreground">?</span>
          </div>
          <p className="text-sm text-muted-foreground italic py-1">
            This comment was deleted.
          </p>
        </div>
        {/* Still render replies under a deleted comment */}
        {replies.length > 0 && (
          <div className="ml-10 flex flex-col gap-3 border-l border-border pl-4">
            {replies.map((reply) => (
              <TaskCommentItem
                key={reply.id}
                comment={reply}
                projectId={projectId}
                taskId={taskId}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const authorInitial = (comment.authorUserId ?? "A").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-2">
      <div className="group flex items-start gap-3">
        {/* Avatar */}
        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-medium text-primary">{authorInitial}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">Admin</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
            {comment.updatedAt &&
              new Date(comment.updatedAt).getTime() !==
                new Date(comment.createdAt).getTime() && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
          </div>

          {/* Body or edit input */}
          {isEditing ? (
            <TaskCommentInput
              projectId={projectId}
              taskId={taskId}
              commentId={comment.id}
              initialContent={comment.body as JSONContent}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <RenderDescription json={comment.body as JSONContent} />
              </div>

              {/* Hover actions */}
              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-muted-foreground"
                  onClick={() => setIsReplying((v) => !v)}
                >
                  <CornerDownRight className="size-3 mr-1" />
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-muted-foreground"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => deleteComment(comment.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-3 mr-1" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Replies */}
      {(replies.length > 0 || isReplying) && (
        <div className="ml-10 flex flex-col gap-3 border-l border-border pl-4">
          {replies.map((reply) => (
            <TaskCommentItem
              key={reply.id}
              comment={reply}
              projectId={projectId}
              taskId={taskId}
            />
          ))}
          {isReplying && (
            <TaskCommentInput
              projectId={projectId}
              taskId={taskId}
              parentId={comment.id}
              onCancel={() => setIsReplying(false)}
              onSuccess={() => setIsReplying(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
