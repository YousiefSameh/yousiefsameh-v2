import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WeeklyReportAttachment } from "@/app/generated/prisma/client";
import { TaskAttachmentCreateValues } from "@/features/admin/tasks/validations";
import {
  ReportAttachmentsResponse,
  createReportAttachment,
  deleteReportAttachment,
  getReportAttachments,
} from "../api";

export const reportAttachmentKeys = {
  all: (projectId: string, reportId: string) =>
    ["admin", "projects", projectId, "reports", reportId, "attachments"] as const,
};

/**
 * Fetch all attachments for a report.
 * Enabled only when both IDs are non-empty.
 */
export function useReportAttachments(projectId: string, reportId: string) {
  return useQuery({
    queryKey: reportAttachmentKeys.all(projectId, reportId),
    queryFn:  () => getReportAttachments(projectId, reportId),
    enabled:  projectId.length > 0 && reportId.length > 0,
  });
}

/**
 * Create an attachment record.
 * Prepends to cache (list is ordered newest-first) so the file row
 * appears immediately without a refetch.
 */
export function useCreateReportAttachment(projectId: string, reportId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskAttachmentCreateValues) =>
      createReportAttachment(projectId, reportId, payload),
    onSuccess: (response) => {
      const created = response.data;
      if (!created) return;
      qc.setQueryData<ReportAttachmentsResponse>(
        reportAttachmentKeys.all(projectId, reportId),
        (old) => {
          if (!old?.data) return old;
          return { ...old, data: [created, ...old.data] };
        },
      );
    },
    onError: () => {
      qc.invalidateQueries({
        queryKey: reportAttachmentKeys.all(projectId, reportId),
      });
    },
  });
}

/**
 * Delete an attachment with optimistic removal and rollback on error.
 */
export function useDeleteReportAttachment(projectId: string, reportId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) =>
      deleteReportAttachment(projectId, reportId, attachmentId),

    onMutate: async (attachmentId) => {
      await qc.cancelQueries({
        queryKey: reportAttachmentKeys.all(projectId, reportId),
      });

      const previous = qc.getQueryData<ReportAttachmentsResponse>(
        reportAttachmentKeys.all(projectId, reportId),
      );

      qc.setQueryData<ReportAttachmentsResponse>(
        reportAttachmentKeys.all(projectId, reportId),
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter(
              (a: WeeklyReportAttachment) => a.id !== attachmentId,
            ),
          };
        },
      );

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(
          reportAttachmentKeys.all(projectId, reportId),
          ctx.previous,
        );
      }
    },

    onSettled: () => {
      qc.invalidateQueries({
        queryKey: reportAttachmentKeys.all(projectId, reportId),
      });
    },
  });
}