import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { TaskComment } from "@/app/generated/prisma/client";
import { TaskCommentCreateValues } from "@/validations/tasks.validation";

const api = (projectId: string, taskId: string) =>
  axios.create({
    baseURL: `/api/admin/projects/${projectId}/tasks/${taskId}/comments`,
    headers: { "Content-Type": "application/json" },
  });

export type CommentResponse = APIResponse<TaskComment>;
export type CommentsResponse = APIResponse<TaskComment[]>;

/**
 * @summary Get all comments for a task
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @returns The comments data or an error message
 */
export async function getTaskComments(
  projectId: string,
  taskId: string,
): Promise<CommentsResponse> {
  try {
    const { data } = await api(projectId, taskId).get<CommentsResponse>("");
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create a new comment for a task
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @param payload - The comment payload (body, parentId)
 * @returns The created comment data or an error message
 */
export async function createComment(
  projectId: string,
  taskId: string,
  payload: TaskCommentCreateValues,
): Promise<CommentResponse> {
  try {
    const { data } = await api(projectId, taskId).post<CommentResponse>("", payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Update a comment
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @param commentId - The ID of the comment
 * @param payload - The updated comment fields (body)
 * @returns The updated comment data or an error message
 */
export async function updateComment(
  projectId: string,
  taskId: string,
  commentId: string,
  payload: { body: string },
): Promise<CommentResponse> {
  try {
    const { data } = await api(projectId, taskId).patch<CommentResponse>(
      `/${commentId}`,
      payload,
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Delete a comment (soft-delete)
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @param commentId - The ID of the comment
 * @returns void or an error message
 */
export async function deleteComment(
  projectId: string,
  taskId: string,
  commentId: string,
): Promise<void> {
  try {
    await api(projectId, taskId).delete(`/${commentId}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}
