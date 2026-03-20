// src/features/admin/projects/api/index.ts

import axios from "axios";
import { Project } from "@/app/generated/prisma/client";
import { APIResponse } from "@/lib/types";
import { ProjectFormValues } from "@/validations/projects.validation";
import { ProjectQuery } from "@/lib/parseQueryParams";
import axiosErrorHandler from "@/lib/axiosErrorHandler";

const api = axios.create({
  baseURL: "/api/admin/projects",
  headers: {
    "Content-Type": "application/json",
  },
});

export type ProjectsResponse = APIResponse<Project[]>;
export type ProjectResponse = APIResponse<Project>;

export type GetProjectsParams = Partial<
  Omit<ProjectQuery, "featured"> & { featured: boolean }
>;

/**
 * @summary Get all projects (for admin)
 * @param page - The page number
 * @param limit - The number of projects per page
 * @param featured - Whether to get featured projects
 * @param category - The category of projects
 * @param status - The status of projects
 * @param type - The type of projects
 * @returns The data and pagination info or an error message
 */
export async function getAdminProjects(
  params?: GetProjectsParams,
): Promise<ProjectsResponse> {
  try {
    const { data } = await api.get<ProjectsResponse>("", { params });
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary: Get a project by ID
 * @param: id - The ID of the project
 * @returns: The project data or an error message
 */
export async function getAdminProject(id: string): Promise<ProjectResponse> {
  try {
    const { data } = await api.get<ProjectResponse>(`/${id}`);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create a new project
 * @param request - the project fields
 * @returns The created project data or an error message
 */
export async function createProject(
  payload: ProjectFormValues,
): Promise<ProjectResponse> {
  try {
    const { data } = await api.post<ProjectResponse>("", payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary: Update a project by ID
 * @param: id - The ID of the project
 * @param: request - the updated fileds
 * @returns: The updated project data or an error message
 */
export async function updateProject(
  id: string,
  payload: Partial<ProjectFormValues>,
): Promise<ProjectResponse> {
  try {
    const { data } = await api.patch<ProjectResponse>(`/${id}`, payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary: Delete a project by ID
 * @param: id - The ID of the project
 * @returns: A success status or error message
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    await api.delete(`/${id}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}