import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskAttachment } from "@/app/generated/prisma/client";
import { TaskAttachmentCreateValues } from "@/validations/tasks.validation";
import {
  AttachmentsResponse,
  createAttachment,
  deleteAttachment,
  getTaskAttachments,
} from "../api";


export const attachmentKeys = {
  all: (projectId: string, taskId: string) =>
    ["admin", "projects", projectId, "tasks", taskId, "attachments"] as const,
};


/**
 * Fetch all attachments for a task.
 * Enabled only when both IDs are non-empty.
 */
export function useTaskAttachments(projectId: string, taskId: string) {
  return useQuery({
    queryKey: attachmentKeys.all(projectId, taskId),
    queryFn: () => getTaskAttachments(projectId, taskId),
    enabled: projectId.length > 0 && taskId.length > 0,
  });
}


/**
 * Create an attachment record.
 * Appends the new attachment to the cached list on success so the UI
 * updates immediately without a round-trip refetch.
 */
export function useCreateAttachment(projectId: string, taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskAttachmentCreateValues) =>
      createAttachment(projectId, taskId, payload),
    onSuccess: (response) => {
      const created = response.data;
      if (!created) return;
      qc.setQueryData<AttachmentsResponse>(
        attachmentKeys.all(projectId, taskId),
        (old) => {
          if (!old?.data) return old;
          return { ...old, data: [created, ...old.data] };
        },
      );
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: attachmentKeys.all(projectId, taskId) });
    },
  });
}

/**
 * Delete an attachment.
 * Optimistically removes the item from the cache and rolls back on error.
 */
export function useDeleteAttachment(projectId: string, taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) =>
      deleteAttachment(projectId, taskId, attachmentId),

    onMutate: async (attachmentId) => {
      await qc.cancelQueries({
        queryKey: attachmentKeys.all(projectId, taskId),
      });

      const previous = qc.getQueryData<AttachmentsResponse>(
        attachmentKeys.all(projectId, taskId),
      );

      qc.setQueryData<AttachmentsResponse>(
        attachmentKeys.all(projectId, taskId),
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter(
              (a: TaskAttachment) => a.id !== attachmentId,
            ),
          };
        },
      );

      return { previous };
    },

    onError: (_err, _attachmentId, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(
          attachmentKeys.all(projectId, taskId),
          ctx.previous,
        );
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: attachmentKeys.all(projectId, taskId) });
    },
  });
}