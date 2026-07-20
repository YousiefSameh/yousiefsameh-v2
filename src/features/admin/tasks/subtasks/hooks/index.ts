import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TaskStatus } from "@/app/generated/prisma/enums";
import { TaskSubtaskCreateValues } from "@/features/admin/tasks/validations";
import { updateTask } from "@/features/admin/tasks/api";
import { taskKeys } from "@/features/admin/tasks/hooks";
import {
  SubtaskWithChild,
  SubtasksResponse,
  createSubtask,
  getTaskSubtasks,
  unlinkSubtask,
} from "../api";

export const subtaskKeys = {
  all: (projectId: string, taskId: string) =>
    ["admin", "projects", projectId, "tasks", taskId, "subtasks"] as const,
};

/**
 * Fetch all subtasks for a parent task.
 * Enabled only when both IDs are non-empty strings.
 */
export function useTaskSubtasks(projectId: string, taskId: string) {
  return useQuery({
    queryKey: subtaskKeys.all(projectId, taskId),
    queryFn: () => getTaskSubtasks(projectId, taskId),
    enabled: projectId.length > 0 && taskId.length > 0,
  });
}

/**
 * Create a new subtask and append it to the cached list optimistically.
 * The server returns the full join record with the child task; on success
 * we replace the optimistic placeholder with the real data.
 */
export function useCreateSubtask(projectId: string, taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskSubtaskCreateValues) =>
      createSubtask(projectId, taskId, payload),
    onSuccess: (response) => {
      const created = response.data;
      if (!created) return;
      qc.setQueryData<SubtasksResponse>(
        subtaskKeys.all(projectId, taskId),
        (old) => {
          if (!old?.data) return old;
          // Append: list is ordered by displayOrder asc (newest at bottom)
          return { ...old, data: [...old.data, created] };
        },
      );
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: subtaskKeys.all(projectId, taskId) });
    },
  });
}

/**
 * Unlink a subtask from its parent.
 * Optimistically removes the row; rolls back on error.
 * `subtaskId` here is the childTaskId on the join record.
 */
export function useUnlinkSubtask(projectId: string, taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (subtaskId: string) =>
      unlinkSubtask(projectId, taskId, subtaskId),

    onMutate: async (subtaskId) => {
      await qc.cancelQueries({ queryKey: subtaskKeys.all(projectId, taskId) });

      const previous = qc.getQueryData<SubtasksResponse>(
        subtaskKeys.all(projectId, taskId),
      );

      qc.setQueryData<SubtasksResponse>(
        subtaskKeys.all(projectId, taskId),
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter(
              (s: SubtaskWithChild) => s.childTaskId !== subtaskId,
            ),
          };
        },
      );

      return { previous };
    },

    onError: (_err, _subtaskId, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(subtaskKeys.all(projectId, taskId), ctx.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: subtaskKeys.all(projectId, taskId) });
    },
  });
}

/**
 * Toggle a subtask's done state.
 * Calls the existing PATCH /tasks/:childTaskId endpoint — no new API needed.
 *
 * On success:
 *  1. Updates the child task's status inside the subtask list cache in-place
 *     so the checkbox reflects immediately without a refetch.
 *  2. Invalidates `taskKeys.all(projectId)` so the Kanban board and the
 *     parent task's `_count` stay in sync.
 */
export function useToggleSubtaskDone(projectId: string, parentTaskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      childTaskId,
      currentStatus,
    }: {
      childTaskId: string;
      currentStatus: string;
    }) => {
      const nextStatus =
        currentStatus === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
      return updateTask(projectId, childTaskId, { status: nextStatus });
    },

    onSuccess: (response, { childTaskId }) => {
      const updatedTask = response.data;
      if (!updatedTask) return;

      // Update the child task status inside the subtask list cache in-place
      qc.setQueryData<SubtasksResponse>(
        subtaskKeys.all(projectId, parentTaskId),
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((s: SubtaskWithChild) =>
              s.childTaskId === childTaskId
                ? {
                    ...s,
                    childTask: { ...s.childTask, status: updatedTask.status },
                  }
                : s,
            ),
          };
        },
      );

      // Invalidate the board and parent task detail so _count stays correct
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
      qc.invalidateQueries({
        queryKey: taskKeys.detail(projectId, parentTaskId),
      });
    },

    onError: () => {
      // On error revalidate the subtask list to restore the correct state
      qc.invalidateQueries({
        queryKey: subtaskKeys.all(projectId, parentTaskId),
      });
    },
  });
}
