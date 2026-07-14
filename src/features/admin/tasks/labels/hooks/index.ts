import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskLabel } from "@/app/generated/prisma/client";
import { LabelFormValues } from "@/features/admin/tasks/validations";
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
  list: (projectId: string) => [...labelKeys.all(projectId), "list"] as const,
};

/**
 * Fetch all labels for a project.
 * 5-minute staleTime — labels are low-churn data that don't need refetching
 * every time the drawer opens/closes or a new component mounts.
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
 * Create a new label and append it to the cached list directly.
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
      qc.invalidateQueries({ queryKey: labelKeys.all(projectId) });
    },
  });
}

/**
 * Update an existing label in-place in the cached list.
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
 * Delete a label optimistically — removes it from the cached list immediately
 * and rolls back on error.
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
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(labelKeys.list(projectId), ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: labelKeys.all(projectId) });
    },
  });
}
