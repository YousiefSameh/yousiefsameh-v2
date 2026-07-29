import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WeeklyReportComment } from "@/app/generated/prisma/client";
import { TaskCommentCreateValues } from "@/features/admin/tasks/validations";
import {
  ReportCommentWithReplies,
  ReportCommentsResponse,
  createReportComment,
  deleteReportComment,
  getReportComments,
  updateReportComment,
} from "../api";

export const reportCommentKeys = {
  all: (projectId: string, reportId: string) =>
    ["admin", "projects", projectId, "reports", reportId, "comments"] as const,
};

/**
 * Fetch all comments for a report. Enabled when both IDs are non-empty.
 */
export function useReportComments(projectId: string, reportId: string) {
  return useQuery({
    queryKey: reportCommentKeys.all(projectId, reportId),
    queryFn:  () => getReportComments(projectId, reportId),
    enabled:  projectId.length > 0 && reportId.length > 0,
  });
}

/**
 * Create a comment or reply.
 * Appends the new comment to the top-level list on success.
 * Replies are embedded inside their parent — the list refetch handles nesting.
 */
export function useCreateReportComment(projectId: string, reportId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskCommentCreateValues) =>
      createReportComment(projectId, reportId, payload),
    onSuccess: (response) => {
      const created = response.data;
      if (!created) return;

      qc.setQueryData<ReportCommentsResponse>(
        reportCommentKeys.all(projectId, reportId),
        (old) => {
          if (!old?.data) return old;

          // If this is a reply, append it inside the parent's replies array
          if (created.parentId) {
            return {
              ...old,
              data: old.data.map((c: ReportCommentWithReplies) =>
                c.id === created.parentId
                  ? { ...c, replies: [...(c.replies ?? []), created] }
                  : c,
              ),
            };
          }

          // Top-level comment — append to the list
          return { ...old, data: [...old.data, created] };
        },
      );
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: reportCommentKeys.all(projectId, reportId) });
    },
  });
}

/**
 * Update a comment's body in-place in the cache.
 */
export function useUpdateReportComment(projectId: string, reportId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      body,
    }: {
      commentId: string;
      body: unknown;
    }) => updateReportComment(projectId, reportId, commentId, { body }),
    onSuccess: (response) => {
      const updated = response.data;
      if (!updated) return;

      qc.setQueryData<ReportCommentsResponse>(
        reportCommentKeys.all(projectId, reportId),
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((c: ReportCommentWithReplies) => {
              if (c.id === updated.id) return { ...c, body: updated.body };
              // Also check replies
              return {
                ...c,
                replies: (c.replies ?? []).map((r: WeeklyReportComment) =>
                  r.id === updated.id ? { ...r, body: updated.body } : r,
                ),
              };
            }),
          };
        },
      );
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: reportCommentKeys.all(projectId, reportId) });
    },
  });
}

/**
 * Soft-delete a comment. Optimistically removes it from the cache,
 * rolling back on error.
 */
export function useDeleteReportComment(projectId: string, reportId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      deleteReportComment(projectId, reportId, commentId),

    onMutate: async (commentId) => {
      await qc.cancelQueries({
        queryKey: reportCommentKeys.all(projectId, reportId),
      });
      const previous = qc.getQueryData<ReportCommentsResponse>(
        reportCommentKeys.all(projectId, reportId),
      );

      qc.setQueryData<ReportCommentsResponse>(
        reportCommentKeys.all(projectId, reportId),
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data
              .filter((c: ReportCommentWithReplies) => c.id !== commentId)
              .map((c: ReportCommentWithReplies) => ({
                ...c,
                replies: (c.replies ?? []).filter(
                  (r: WeeklyReportComment) => r.id !== commentId,
                ),
              })),
          };
        },
      );

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(reportCommentKeys.all(projectId, reportId), ctx.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: reportCommentKeys.all(projectId, reportId) });
    },
  });
}