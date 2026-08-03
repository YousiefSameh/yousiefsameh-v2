import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { ActivityLog } from "@/app/generated/prisma/client";

const api = (projectId: string) =>
  axios.create({
    baseURL: `/api/admin/projects/${projectId}/activity`,
    headers: { "Content-Type": "application/json" },
  });

export type ProjectActivityResponse = APIResponse<ActivityLog[]>;

/**
 * @summary Get paginated activity log entries for a project.
 * @param projectId - The ID of the project
 * @param params    - Optional { page } for pagination
 */
export async function getProjectActivity(
  projectId: string,
  params?: { page?: number },
): Promise<ProjectActivityResponse> {
  try {
    const { data } = await api(projectId).get<ProjectActivityResponse>("", {
      params,
    });
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}
