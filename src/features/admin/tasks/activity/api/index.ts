import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { ActivityLog } from "@/app/generated/prisma/client";

const api = (projectId: string, taskId: string) =>
  axios.create({
    baseURL: `/api/admin/projects/${projectId}/tasks/${taskId}/activity`,
    headers: { "Content-Type": "application/json" },
  });

export type ActivityResponse = APIResponse<ActivityLog[]>;

/**
 * @summary Get paginated activity log entries for a task.
 * @param projectId - The ID of the project
 * @param taskId    - The ID of the task
 * @param params    - Optional { page } for pagination
 * @returns Paginated ActivityLog list ordered newest-first
 */
export async function getTaskActivity(
  projectId: string,
  taskId: string,
  params?: { page?: number },
): Promise<ActivityResponse> {
  try {
    const { data } = await api(projectId, taskId).get<ActivityResponse>("", {
      params,
    });
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}