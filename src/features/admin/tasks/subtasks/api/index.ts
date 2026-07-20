import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { Task, TaskSubtask } from "@/app/generated/prisma/client";
import { TaskSubtaskCreateValues } from "@/features/admin/tasks/validations";

const api = (projectId: string, taskId: string) =>
  axios.create({
    baseURL: `/api/admin/projects/${projectId}/tasks/${taskId}/subtasks`,
    headers: { "Content-Type": "application/json" },
  });

export type SubtaskWithChild = TaskSubtask & {
  childTask: Omit<Task, "descriptionRich">;
};

export type SubtaskResponse = APIResponse<SubtaskWithChild>;
export type SubtasksResponse = APIResponse<SubtaskWithChild[]>;

/**
 * @summary Get all subtasks for a task
 * @param projectId - The ID of the project
 * @param taskId    - The parent task ID
 * @returns Join records with child task included, ordered by displayOrder asc
 */
export async function getTaskSubtasks(
  projectId: string,
  taskId: string,
): Promise<SubtasksResponse> {
  try {
    const { data } = await api(projectId, taskId).get<SubtasksResponse>("");
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create a new subtask (child Task + join record in one transaction)
 * @param projectId - The ID of the project
 * @param taskId    - The parent task ID
 * @param payload   - { title: string }
 * @returns The created join record with the child task included
 */
export async function createSubtask(
  projectId: string,
  taskId: string,
  payload: TaskSubtaskCreateValues,
): Promise<SubtaskResponse> {
  try {
    const { data } = await api(projectId, taskId).post<SubtaskResponse>(
      "",
      payload,
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Unlink a subtask from its parent (join record only — child task survives)
 * @param projectId - The ID of the project
 * @param taskId    - The parent task ID
 * @param subtaskId - The child task ID (childTaskId on the join record)
 */
export async function unlinkSubtask(
  projectId: string,
  taskId: string,
  subtaskId: string,
): Promise<void> {
  try {
    await api(projectId, taskId).delete(`/${subtaskId}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}
