import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskLabel } from "@/app/generated/prisma/client";
import { LabelFormValues } from "@/validations/labels.validation";
import {
  createLabel,
  deleteLabel,
  getProjectLabels,
  LabelsResponse,
  updateLabel,
} from "../api";

export const labelKeys = {
  all: (projectId: string) =>
    ["admin", "projects", projectId, "labels"] as const,
  list: (projectId: string) =>
    [...labelKeys.all(projectId), "list"] as const,
};

/**
 * Fetch all labels for a project.
 * Used by: LabelSelect (drawer sidebar), LabelManager (toolbar), Kanban toolbar filter
 */
export function useProjectLabels(projectId: string) {
  return useQuery({
    queryKey: labelKeys.list(projectId),
    queryFn: () => getProjectLabels(projectId),
    enabled: projectId.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a new label.
 * Appends the new label to the cached list optimistically so the UI
 * reflects the addition before the server responds.
 */
export function useCreateLabel(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: LabelFormValues) => createLabel(projectId, payload),
    onSuccess: (response) => {
      const created = response.data;
      if (!created) return;
      qc.setQueryData<LabelsResponse>(labelKeys.list(projectId), (old) => {
        if (!old?.data) return old;
        return { ...old, data: [...old.data, created] };
      });
    },
    onError: () => {
      // Full invalidation on error to ensure cache reflects server truth.
      qc.invalidateQueries({ queryKey: labelKeys.all(projectId) });
    },
  });
}

/**
 * Update an existing label (name and/or color).
 * Updates the label in-place in the cached list.
 */
export function useUpdateLabel(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      labelId,
      payload,
    }: {
      labelId: string;
      payload: Partial<LabelFormValues>;
    }) => updateLabel(projectId, labelId, payload),
    onSuccess: (response) => {
      const updated = response.data;
      if (!updated) return;
      qc.setQueryData<LabelsResponse>(labelKeys.list(projectId), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((l: TaskLabel) =>
            l.id === updated.id ? updated : l,
          ),
        };
      });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: labelKeys.all(projectId) });
    },
  });
}

/**
 * Delete a label.
 * Optimistically removes the label from the cached list.
 * Rolls back if the server call fails.
 */
export function useDeleteLabel(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => deleteLabel(projectId, labelId),
    onMutate: async (labelId) => {
      await qc.cancelQueries({ queryKey: labelKeys.list(projectId) });

      const previous = qc.getQueryData<LabelsResponse>(
        labelKeys.list(projectId),
      );

      qc.setQueryData<LabelsResponse>(labelKeys.list(projectId), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((l: TaskLabel) => l.id !== labelId),
        };
      });

      return { previous };
    },
    onError: (_err, _labelId, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(labelKeys.list(projectId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: labelKeys.all(projectId) });
    },
  });
}