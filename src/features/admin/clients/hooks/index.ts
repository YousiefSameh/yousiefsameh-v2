import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getAdminClients,
  getAdminClient,
  createClient,
  updateClient,
  deleteClient,
  regenerateClientToken,
  GetClientsParams,
  ClientResponse,
  ClientsResponse,
} from "../api";
import { ClientFormValues } from "@/features/admin/clients/validations/clients.validation";
import { Client } from "@/app/generated/prisma/client";

type ClientWithCount = Client & {
  _count: { projects: number };
};

type ClientWithProjects = Client & {
  _count: { projects: number };
  projects: {
    id: string;
    title: string;
    slug: string;
    status: string;
    thumbnailUrl: string | null;
  }[];
};

export const clientKeys = {
  all: () => ["admin", "clients"] as const,
  list: (p?: GetClientsParams) => [...clientKeys.all(), "list", p] as const,
  detail: (id: string) => [...clientKeys.all(), "detail", id] as const,
};

/**
 * Fetch paginated + filtered list of clients.
 * Keeps previous data while new page loads (no flicker).
 */
export function useAdminClients(params?: GetClientsParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => getAdminClients(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch a single client by ID with their projects.
 */
export function useAdminClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getAdminClient(id),
    enabled: id.length > 0,
  });
}

/**
 * Create a new client.
 * Adds the new client to the list cache on success.
 */
export function useCreateClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClientFormValues) => createClient(payload),
    onSuccess: (response) => {
      qc.setQueryData<ClientsResponse>(clientKeys.list(), (old) => {
        if (!old || !response.data) return old;
        return {
          ...old,
          data: [response.data, ...(old.data ?? [])] as ClientWithCount[],
        };
      });
      qc.invalidateQueries({ queryKey: clientKeys.all() });
    },
  });
}

/**
 * Update a client.
 * Optimistically updates the detail cache, rolls back on error.
 */
export function useUpdateClient(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ClientFormValues>) =>
      updateClient(id, payload),

    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: clientKeys.detail(id) });
      const previous = qc.getQueryData<ClientResponse>(clientKeys.detail(id));

      qc.setQueryData<ClientResponse>(clientKeys.detail(id), (old) => {
        if (!old) return old;
        return {
          ...old,
          data: { ...old.data, ...payload } as ClientWithProjects,
        };
      });

      return { previous };
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(clientKeys.detail(id), ctx.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: clientKeys.detail(id) });
      qc.invalidateQueries({ queryKey: clientKeys.all() });
    },
  });
}

/**
 * Delete a client.
 * Removes from cache immediately on success.
 */
export function useDeleteClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: clientKeys.detail(id) });
      qc.invalidateQueries({ queryKey: clientKeys.all() });
    },
  });
}

/**
 * Regenerate access token for a client.
 * Updates the detail cache with the new token on success.
 */
export function useRegenerateClientToken(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (expiresInDays?: number) =>
      regenerateClientToken(id, expiresInDays),
    onSuccess: (response) => {
      qc.setQueryData<ClientResponse>(clientKeys.detail(id), (old) => {
        if (!old || !response.data) return old;
        return { ...old, data: response.data };
      });
    },
  });
}
