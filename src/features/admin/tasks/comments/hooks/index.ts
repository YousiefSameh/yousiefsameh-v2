import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskComment } from "@/app/generated/prisma/client";
import {
  TaskCommentCreateValues,
  TaskCommentUpdateValues,
} from "@/features/admin/tasks/validations";
import {
  createComment,
  deleteComment,
  getTaskComments,
  CommentsResponse,
  updateComment,
} from "../api";

export const commentKeys = {
  all: (projectId: string, taskId: string) =>
    ["admin", "projects", projectId, "tasks", taskId, "comments"] as const,
  list: (projectId: string, taskId: string) =>
    [...commentKeys.all(projectId, taskId), "list"] as const,
};

/**
 * Fetch all comments for a task.
 */
export function useTaskComments(projectId: string, taskId: string) {
  return useQuery({
    queryKey: commentKeys.list(projectId, taskId),
    queryFn: () => getTaskComments(projectId, taskId),
    enabled: projectId.length > 0 && taskId.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute stale time
  });
}

/**
 * Create a new comment.
 */
export function useCreateComment(projectId: string, taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskCommentCreateValues) =>
      createComment(projectId, taskId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.list(projectId, taskId) });
    },
  });
}

/**
 * Update an existing comment.
 */
export function useUpdateComment(projectId: string, taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: TaskCommentUpdateValues;
    }) => updateComment(projectId, taskId, commentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commentKeys.list(projectId, taskId) });
    },
  });
}

/**
 * Delete a comment (soft-delete).
 * Optimistically removes the comment from the cache.
 */
export function useDeleteComment(projectId: string, taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      deleteComment(projectId, taskId, commentId),
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: commentKeys.list(projectId, taskId) });

      const previous = qc.getQueryData<CommentsResponse>(
        commentKeys.list(projectId, taskId),
      );

      qc.setQueryData<CommentsResponse>(
        commentKeys.list(projectId, taskId),
        (old) => {
          if (!old?.data) return old;
          // Soft-delete: update deletedAt field optimistically
          return {
            ...old,
            data: old.data.map((c: TaskComment) =>
              c.id === commentId ? { ...c, deletedAt: new Date() } : c,
            ),
          };
        },
      );

      return { previous };
    },
    onError: (_err, _commentId, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(commentKeys.list(projectId, taskId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: commentKeys.list(projectId, taskId) });
    },
  });
}
