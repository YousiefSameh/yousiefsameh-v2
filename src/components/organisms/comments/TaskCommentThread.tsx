"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/atoms/skeleton";
import { useTaskComments } from "@/features/admin/tasks/comments/hooks";
import { TaskCommentItem } from "./TaskCommentItem";
import { TaskCommentInput } from "./TaskCommentInput";
import type { TaskComment } from "@/app/generated/prisma/client";

interface TaskCommentThreadProps {
  projectId: string;
  taskId: string;
}

export function TaskCommentThread({ projectId, taskId }: TaskCommentThreadProps) {
  const { data: response, isLoading, isError } = useTaskComments(projectId, taskId);

  const allComments: TaskComment[] = response?.data ?? [];

  // Split into top-level and replies
  const topLevel = allComments.filter((c) => c.parentId === null);
  const repliesMap = allComments.reduce<Record<string, TaskComment[]>>((acc, c) => {
    if (c.parentId) {
      (acc[c.parentId] ??= []).push(c);
    }
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="size-7 rounded-full shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive text-center py-4">
        Failed to load comments.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Thread */}
      {topLevel.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <MessageSquare className="size-8 opacity-30" />
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {topLevel.map((comment) => (
            <TaskCommentItem
              key={comment.id}
              comment={comment}
              projectId={projectId}
              taskId={taskId}
              replies={repliesMap[comment.id] ?? []}
            />
          ))}
        </div>
      )}

      {/* New comment input */}
      <TaskCommentInput projectId={projectId} taskId={taskId} />
    </div>
  );
}
