import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { TaskAttachment } from "@/app/generated/prisma/client";
import { TaskAttachmentCreateValues } from "@/features/admin/tasks/validations";

const api = (projectId: string, taskId: string) =>
  axios.create({
    baseURL: `/api/admin/projects/${projectId}/tasks/${taskId}/attachments`,
    headers: { "Content-Type": "application/json" },
  });

export type AttachmentResponse = APIResponse<TaskAttachment>;
export type AttachmentsResponse = APIResponse<TaskAttachment[]>;

/**
 * @summary Get all attachments for a task
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @returns Attachments list ordered newest-first
 */
export async function getTaskAttachments(
  projectId: string,
  taskId: string,
): Promise<AttachmentsResponse> {
  try {
    const { data } = await api(projectId, taskId).get<AttachmentsResponse>("");
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create an attachment record after the file has been uploaded to S3.
 * Callers must upload the file first (via uploadMultipleImages) and then pass
 * the resulting url and path here.
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @param payload - { filePath, url, fileName, mimeType?, sizeBytes? }
 * @returns The created attachment record
 */
export async function createAttachment(
  projectId: string,
  taskId: string,
  payload: TaskAttachmentCreateValues,
): Promise<AttachmentResponse> {
  try {
    const { data } = await api(projectId, taskId).post<AttachmentResponse>(
      "",
      payload,
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Delete an attachment (DB record + S3 object)
 * @param projectId - The ID of the project
 * @param taskId - The ID of the task
 * @param attachmentId - The ID of the attachment to delete
 */
export async function deleteAttachment(
  projectId: string,
  taskId: string,
  attachmentId: string,
): Promise<void> {
  try {
    await api(projectId, taskId).delete(`/${attachmentId}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}
