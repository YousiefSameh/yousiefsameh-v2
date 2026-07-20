import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { WeeklyReport } from "@/app/generated/prisma/client";
import { ReportFormValues, ReportQuery } from "../validations";

const api = (projectId: string) =>
  axios.create({
    baseURL: `/api/admin/projects/${projectId}/reports`,
    headers: { "Content-Type": "application/json" },
  });

export type ReportWithMeta = WeeklyReport & {
  _count: { comments: number; attachments: number };
};

export type ReportResponse  = APIResponse<ReportWithMeta>;
export type ReportsResponse = APIResponse<ReportWithMeta[]>;

export type GetReportsParams = Partial<ReportQuery>;


/**
 * @summary Get paginated list of reports for a project
 * @param projectId - The project ID
 * @param params    - Optional filters: status, search, page, limit
 */
export async function getAdminReports(
  projectId: string,
  params?: GetReportsParams,
): Promise<ReportsResponse> {
  try {
    const { data } = await api(projectId).get<ReportsResponse>("", { params });
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Get a single report by ID
 * @param projectId - The project ID
 * @param reportId  - The report ID
 */
export async function getAdminReport(
  projectId: string,
  reportId: string,
): Promise<ReportResponse> {
  try {
    const { data } = await api(projectId).get<ReportResponse>(`/${reportId}`);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create a new report
 * @param projectId - The project ID
 * @param payload   - { title, content?, status? }
 */
export async function createReport(
  projectId: string,
  payload: ReportFormValues,
): Promise<ReportResponse> {
  try {
    const { data } = await api(projectId).post<ReportResponse>("", payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Update a report (title and/or content)
 * @param projectId - The project ID
 * @param reportId  - The report ID
 * @param payload   - Partial report fields
 */
export async function updateReport(
  projectId: string,
  reportId: string,
  payload: Partial<ReportFormValues>,
): Promise<ReportResponse> {
  try {
    const { data } = await api(projectId).patch<ReportResponse>(
      `/${reportId}`,
      payload,
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Toggle a report between DRAFT and PUBLISHED.
 * Sends no body — the server derives the next state from current status.
 * @param projectId - The project ID
 * @param reportId  - The report ID
 */
export async function publishReport(
  projectId: string,
  reportId: string,
): Promise<ReportResponse> {
  try {
    const { data } = await api(projectId).post<ReportResponse>(
      `/${reportId}/publish`,
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Delete a report (cascades to comments and attachments)
 * @param projectId - The project ID
 * @param reportId  - The report ID
 */
export async function deleteReport(
  projectId: string,
  reportId: string,
): Promise<void> {
  try {
    await api(projectId).delete(`/${reportId}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}