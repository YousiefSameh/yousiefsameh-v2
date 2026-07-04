"use client";

import { useCallback } from "react";
import { useUpdateTask } from "@/features/admin/tasks/hooks";
import { TaskFormValues } from "@/validations/tasks.validation";

type UpdatableTaskFields = Omit<TaskFormValues, "projectId">;

export function useInlineTaskField<K extends keyof UpdatableTaskFields>(
  projectId: string,
  taskId: string,
  field: K
) {
  const mutation = useUpdateTask(projectId, taskId);

  const updateField = useCallback(
    (value: UpdatableTaskFields[K]) => {
      mutation.mutate({ [field]: value } as Partial<UpdatableTaskFields>);
    },
    [mutation, field]
  );

  return {
    updateField,
    isPending: mutation.isPending,
  };
}
