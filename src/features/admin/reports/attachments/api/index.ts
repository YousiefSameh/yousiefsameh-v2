import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { WeeklyReportAttachment } from "@/app/generated/prisma/client";
import { TaskAttachmentCreateValues } from "@/features/admin/tasks/validations"; 

const api = (projectId: string, reportId: string) =>
  axios.create({
    baseURL: `/api/admin/projects/${projectId}/reports/${reportId}/attachments`,
    headers: { "Content-Type": "application/json" },
  });

export type ReportAttachmentResponse = APIResponse<WeeklyReportAttachment>;
export type ReportAttachmentsResponse = APIResponse<WeeklyReportAttachment[]>;


/**
 * @summary Get all attachments for a report, ordered newest-first.
 * @param id - The ID of the project
 * @param reportId - The ID of the report
 * @returns The attachments data or an error message
 */

export async function getReportAttachments(
  projectId: string,
  reportId: string,
): Promise<ReportAttachmentsResponse> {
  try {
    const { data } = await api(
      projectId,
      reportId,
    ).get<ReportAttachmentsResponse>("");
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}


/**
 * @summary Create an attachment record after the client has uploaded to S3.
 * WeeklyReportAttachment has no uploadedByType/uploadedByUserId fields —
 * only the file metadata is stored.
 * @param id - The ID of the project
 * @param reportId - The ID of the report
 * @returns The attachment data or an error message
 */

export async function createReportAttachment(
  projectId: string,
  reportId: string,
  payload: TaskAttachmentCreateValues,
): Promise<ReportAttachmentResponse> {
  try {
    const { data } = await api(
      projectId,
      reportId,
    ).post<ReportAttachmentResponse>("", payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}


/**
 * @summary Delete a report attachment.
 * @description Verifies the attachment belongs to the report and project before deleting.
 * DB record is deleted first; S3 cleanup is fire-and-forget.
 * @param id - The ID of the project
 * @param reportId - The ID of the report
 * @param attachmentId - The ID of the attachment
 * @returns The attachment data or an error message
 */

export async function deleteReportAttachment(
  projectId: string,
  reportId: string,
  attachmentId: string,
): Promise<void> {
  try {
    await api(projectId, reportId).delete(`/${attachmentId}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}
