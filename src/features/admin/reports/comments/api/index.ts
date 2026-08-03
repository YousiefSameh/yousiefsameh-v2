import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { WeeklyReportComment } from "@/app/generated/prisma/client";
import { TaskCommentCreateValues } from "@/features/admin/tasks/validations";

const api = (projectId: string, reportId: string) =>
  axios.create({
    baseURL: `/api/admin/projects/${projectId}/reports/${reportId}/comments`,
    headers: { "Content-Type": "application/json" },
  });

export type ReportCommentWithReplies = WeeklyReportComment & {
  replies: WeeklyReportComment[];
};

export type ReportCommentResponse = APIResponse<ReportCommentWithReplies>;
export type ReportCommentsResponse = APIResponse<ReportCommentWithReplies[]>;

/**
 * @summary Get all top-level comments for a report (with one level of replies)
 * @param projectId - The project ID
 * @param reportId  - The report ID
 */
export async function getReportComments(
  projectId: string,
  reportId: string,
): Promise<ReportCommentsResponse> {
  try {
    const { data } = await api(projectId, reportId).get<ReportCommentsResponse>(
      "",
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create a comment (or reply) on a report
 * @param projectId - The project ID
 * @param reportId  - The report ID
 * @param payload   - { body, parentId? }
 */
export async function createReportComment(
  projectId: string,
  reportId: string,
  payload: TaskCommentCreateValues,
): Promise<ReportCommentResponse> {
  try {
    const { data } = await api(projectId, reportId).post<ReportCommentResponse>(
      "",
      payload,
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Update a report comment body
 * @param projectId - The project ID
 * @param reportId  - The report ID
 * @param commentId - The comment ID
 * @param payload   - { body: unknown } TapTap JSON Text
 */
export async function updateReportComment(
  projectId: string,
  reportId: string,
  commentId: string,
  payload: { body: unknown },
): Promise<ReportCommentResponse> {
  try {
    const { data } = await api(
      projectId,
      reportId,
    ).patch<ReportCommentResponse>(`/${commentId}`, payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Soft-delete a report comment
 * @param projectId - The project ID
 * @param reportId  - The report ID
 * @param commentId - The comment ID
 */
export async function deleteReportComment(
  projectId: string,
  reportId: string,
  commentId: string,
): Promise<void> {
  try {
    await api(projectId, reportId).delete(`/${commentId}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}
