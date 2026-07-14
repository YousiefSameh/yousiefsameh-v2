import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  getAdminTask,
  getAdminTasks,
  moveTask,
  updateTask,
  GetTasksParams,
  TaskResponse,
  TasksResponse,
} from "../api";
import {
  TaskFormValues,
  TaskMovePayload,
} from "@/features/admin/tasks/validations";

export const taskKeys = {
  all: (projectId: string) =>
    ["admin", "projects", projectId, "tasks"] as const,
  list: (projectId: string, p?: GetTasksParams) =>
    [...taskKeys.all(projectId), "list", p] as const,
  detail: (projectId: string, taskId: string) =>
    [...taskKeys.all(projectId), "detail", taskId] as const,
};

/**
 * Fetch paginated + filtered list of tasks.
 * Keeps previous data while new page loads (no flicker).
 */
export function useAdminTasks(projectId: string, params?: GetTasksParams) {
  return useQuery({
    queryKey: taskKeys.list(projectId, params),
    queryFn: () => getAdminTasks(projectId, params),
    enabled: projectId.length > 0,
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single task by ID.
 */
export function useAdminTask(projectId: string, taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(projectId, taskId),
    queryFn: () => getAdminTask(projectId, taskId),
    enabled: projectId.length > 0 && taskId.length > 0,
  });
}

/**
 * Create a new task.
 */
export function useCreateTask(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<TaskFormValues, "projectId">) =>
      createTask(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}

/**
 * Update a task.
 */
export function useUpdateTask(projectId: string, taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Omit<TaskFormValues, "projectId">>) =>
      updateTask(projectId, taskId, payload),
    onSuccess: (response) => {
      qc.setQueryData<TaskResponse>(
        taskKeys.detail(projectId, taskId),
        response,
      );
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}

/**
 * Delete a task.
 */
export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(projectId, taskId),
    onSuccess: (_data, taskId) => {
      qc.removeQueries({ queryKey: taskKeys.detail(projectId, taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}

/**
 * Move a task.
 * Optimistically updates the list cache, rolls back on error.
 */
export function useMoveTask(projectId: string, taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskMovePayload) =>
      moveTask(projectId, taskId, payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: taskKeys.all(projectId) });

      const prev = qc.getQueriesData<TasksResponse>({
        queryKey: taskKeys.all(projectId),
      });

      // Optimistic update: reorder tasks for any cached list query.
      prev.forEach(([key, value]) => {
        if (!value?.data) return;
        const next = value.data.map((t) =>
          payload.orderedTaskIds.includes(t.id)
            ? { ...t, status: payload.status }
            : t,
        );
        next.sort((a, b) => {
          if (a.status === b.status && payload.status === a.status) {
            const ai = payload.orderedTaskIds.indexOf(a.id);
            const bi = payload.orderedTaskIds.indexOf(b.id);
            if (ai !== -1 && bi !== -1) return ai - bi;
          }
          return String(a.status).localeCompare(String(b.status));
        });
        qc.setQueryData<TasksResponse>(key, { ...value, data: next });
      });

      return { prev };
    },
    onError: (_err, _payload, ctx) => {
      ctx?.prev?.forEach(([key, value]) => qc.setQueryData(key, value));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
    },
  });
}
