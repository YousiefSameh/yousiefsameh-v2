import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createReport,
  deleteReport,
  getAdminReport,
  getAdminReports,
  publishReport,
  updateReport,
  GetReportsParams,
  ReportResponse,
  ReportsResponse,
  ReportWithMeta,
} from "../api";
import { ReportFormValues } from "../validations";

export const reportKeys = {
  all: (projectId: string) =>
    ["admin", "projects", projectId, "reports"] as const,
  list: (projectId: string, p?: GetReportsParams) =>
    [...reportKeys.all(projectId), "list", p] as const,
  detail: (projectId: string, reportId: string) =>
    [...reportKeys.all(projectId), "detail", reportId] as const,
};

/**
 * Fetch paginated + filtered list of reports.
 * Keeps previous data while a new page loads (no flicker on filter change).
 */
export function useAdminReports(projectId: string, params?: GetReportsParams) {
  return useQuery({
    queryKey: reportKeys.list(projectId, params),
    queryFn: () => getAdminReports(projectId, params),
    enabled: projectId.length > 0,
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single report by ID.
 * Used on the detail page; includes full `content` JSON for the editor.
 */
export function useAdminReport(projectId: string, reportId: string) {
  return useQuery({
    queryKey: reportKeys.detail(projectId, reportId),
    queryFn: () => getAdminReport(projectId, reportId),
    enabled: projectId.length > 0 && reportId.length > 0,
  });
}

/**
 * Create a new report.
 * Invalidates the list cache so the new report appears immediately.
 */
export function useCreateReport(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReportFormValues) => createReport(projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reportKeys.all(projectId) });
    },
  });
}

/**
 * Update a report (title and/or content).
 * Updates the detail cache immediately with the server response,
 * then invalidates the list so status/title changes propagate there too.
 */
export function useUpdateReport(projectId: string, reportId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ReportFormValues>) =>
      updateReport(projectId, reportId, payload),
    onSuccess: (response) => {
      qc.setQueryData<ReportResponse>(
        reportKeys.detail(projectId, reportId),
        response,
      );
      qc.invalidateQueries({ queryKey: reportKeys.all(projectId) });
    },
  });
}

/**
 * Toggle a report between DRAFT and PUBLISHED.
 * Updates both the detail cache and the list cache so the status badge
 * reflects the change everywhere without a full refetch.
 */
export function usePublishReport(projectId: string, reportId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => publishReport(projectId, reportId),
    onSuccess: (response) => {
      // Update detail cache directly
      qc.setQueryData<ReportResponse>(
        reportKeys.detail(projectId, reportId),
        response,
      );

      // Update the report in-place inside any cached list pages
      const updatedReport = response.data;
      if (updatedReport) {
        qc.setQueriesData<ReportsResponse>(
          { queryKey: reportKeys.all(projectId) },
          (old) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((r: ReportWithMeta) =>
                r.id === reportId ? { ...r, status: updatedReport.status } : r,
              ),
            };
          },
        );
      }
    },
    onError: () => {
      // Full invalidation on error to reconcile any partial state
      qc.invalidateQueries({ queryKey: reportKeys.all(projectId) });
    },
  });
}

/**
 * Delete a report.
 * Removes the detail cache entry and invalidates the list.
 */
export function useDeleteReport(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => deleteReport(projectId, reportId),
    onSuccess: (_data, reportId) => {
      qc.removeQueries({
        queryKey: reportKeys.detail(projectId, reportId),
      });
      qc.invalidateQueries({ queryKey: reportKeys.all(projectId) });
    },
  });
}
