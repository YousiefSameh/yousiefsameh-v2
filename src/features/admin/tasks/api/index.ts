import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { Task, TaskLabel } from "@/app/generated/prisma/client";
import {
  TaskFormValues,
  TaskMovePayload,
  TaskQuery,
} from "@/features/admin/tasks/validations";

const api = (projectId: string) => {
  return axios.create({
    baseURL: `/api/admin/projects/${projectId}/tasks`,
    headers: { "Content-Type": "application/json" },
  });
};

export type TaskLabelAssignmentShape = {
  label: TaskLabel;
};

export type TaskWithMeta = Task & {
  labels: TaskLabelAssignmentShape[];
  _count: { comments: number; attachments: number };
};

export type TasksResponse = APIResponse<TaskWithMeta[]>;
export type TaskResponse = APIResponse<TaskWithMeta>;

export type GetTasksParams = Partial<TaskQuery>;

/**
 * @summary Get all tasks (for admin)
 * @param projectId - The project ID
 * @param params - The parameters for the query
 * @param status - The status of tasks
 * @param priority - The priority of tasks
 * @param type - The type of tasks
 * @param assigneeId - The assignee of tasks
 * @param labelId - The label of tasks
 * @param search - The search query
 * @returns The data and pagination info or an error message
 */
export async function getAdminTasks(
  projectId: string,
  params?: GetTasksParams,
): Promise<TasksResponse> {
  try {
    const { data } = await api(projectId).get<TasksResponse>("", { params });
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary: Get a task by ID
 * @param: projectId - The ID of the project
 * @param: taskId - The ID of the task
 * @returns: The task data or an error message
 */
export async function getAdminTask(
  projectId: string,
  taskId: string,
): Promise<TaskResponse> {
  try {
    const { data } = await api(projectId).get<TaskResponse>(`/${taskId}`);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create a new task
 * @param projectId - The ID of the project
 * @param payload - the task fields
 * @returns The created task data or an error message
 */
export async function createTask(
  projectId: string,
  payload: Omit<TaskFormValues, "projectId">,
): Promise<TaskResponse> {
  try {
    const { data } = await api(projectId).post<TaskResponse>("", payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Update a task
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @param payload - the updated task fields
 * @returns The updated task data or an error message
 */
export async function updateTask(
  projectId: string,
  taskId: string,
  payload: Partial<Omit<TaskFormValues, "projectId">>,
): Promise<TaskResponse> {
  try {
    const { data } = await api(projectId).patch<TaskResponse>(
      `/${taskId}`,
      payload,
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Delete a task
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @returns The deleted task data or an error message
 */
export async function deleteTask(projectId: string, taskId: string) {
  try {
    await api(projectId).delete(`/${taskId}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Move a task
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @param payload - the payload for the move
 * @returns The moved task data or an error message
 */
export async function moveTask(
  projectId: string,
  taskId: string,
  payload: TaskMovePayload,
) {
  try {
    const { data } = await api(projectId).post<APIResponse<boolean>>(
      `/${taskId}/move`,
      payload,
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}
