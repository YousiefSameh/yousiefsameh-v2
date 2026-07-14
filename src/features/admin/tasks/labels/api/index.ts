import axios from "axios";
import { APIResponse } from "@/lib/types";
import axiosErrorHandler from "@/lib/axiosErrorHandler";
import { TaskLabel } from "@/app/generated/prisma/client";
import { LabelFormValues } from "@/validations/labels.validation";

const api = (projectId: string) =>
  axios.create({
    baseURL: `/api/admin/projects/${projectId}/labels`,
    headers: { "Content-Type": "application/json" },
  });

export type LabelResponse = APIResponse<TaskLabel>;
export type LabelsResponse = APIResponse<TaskLabel[]>;

/**
 * @summary Get all labels for a project
 * @param projectId - The ID of the project
 * @returns The labels data or an error message
 */
export async function getProjectLabels(
  projectId: string,
): Promise<LabelsResponse> {
  try {
    const { data } = await api(projectId).get<LabelsResponse>("");
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create a new label
 * @param projectId - The ID of the project
 * @param payload   - { name, color? }
 * @returns The created label data or an error message
 */
export async function createLabel(
  projectId: string,
  payload: LabelFormValues,
): Promise<LabelResponse> {
  try {
    const { data } = await api(projectId).post<LabelResponse>("", payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Update a label
 * @param projectId - The ID of the project
 * @param labelId   - The ID of the label
 * @param payload   - Partial { name, color }
 */
export async function updateLabel(
  projectId: string,
  labelId: string,
  payload: Partial<LabelFormValues>,
): Promise<LabelResponse> {
  try {
    const { data } = await api(projectId).patch<LabelResponse>(
      `/${labelId}`,
      payload,
    );
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Delete a label (cascades to label assignments)
 * @param projectId - The ID of the project
 * @param labelId   - The ID of the label
 */
export async function deleteLabel(
  projectId: string,
  labelId: string,
): Promise<void> {
  try {
    await api(projectId).delete(`/${labelId}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}