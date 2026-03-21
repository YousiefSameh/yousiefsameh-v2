import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getAdminProjects,
  getAdminProject,
  createProject,
  updateProject,
  deleteProject,
  GetProjectsParams,
  ProjectResponse,
  ProjectsResponse,
} from "../api";
import { ProjectFormValues } from "@/validations/projects.validation";
import { Project } from "@/app/generated/prisma/client";

export const projectKeys = {
  all: () => ["admin", "projects"] as const,
  list: (p?: GetProjectsParams) => [...projectKeys.all(), "list", p] as const,
  detail: (id: string) => [...projectKeys.all(), "detail", id] as const,
};

/**
 * Fetch paginated + filtered list of projects.
 * Keeps previous data while new page loads (no flicker).
 */
export function useAdminProjects(params?: GetProjectsParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => getAdminProjects(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single project by ID.
 */
export function useAdminProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getAdminProject(id),
    enabled: id.length > 0,
  });
}

/**
 * Create a new project.
 * Invalidates the list so it refetches automatically.
 */
export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectFormValues) => createProject(payload),
    onSuccess: (response) => {
      qc.setQueryData<ProjectsResponse>(projectKeys.list(), (old) => {
        if (!old || !response.data) return old;
        return {
          ...old,
          data: [response.data, ...(old.data ?? [])] as Project[],
        };
      });
      qc.invalidateQueries({ queryKey: projectKeys.all() });
    },
  });
}

/**
 * Update a project.
 * Optimistically updates the detail cache, rolls back on error.
 */
export function useUpdateProject(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ProjectFormValues>) =>
      updateProject(id, payload),

    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: projectKeys.detail(id) });
      const previous = qc.getQueryData<ProjectResponse>(projectKeys.detail(id));

      qc.setQueryData<ProjectResponse>(projectKeys.detail(id), (old) => {
        if (!old) return old;
        return {
          ...old,
          data: { ...old.data, ...payload } as Project,
        };
      });

      return { previous };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(projectKeys.detail(id), ctx.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) });
      qc.invalidateQueries({ queryKey: projectKeys.all() });
    },
  });
}

/**
 * Delete a project.
 * Removes it from cache immediately, refetches list on settle.
 */
export function useDeleteProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),

    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: projectKeys.detail(id) });
      qc.invalidateQueries({ queryKey: projectKeys.all() });
    },
  });
}
