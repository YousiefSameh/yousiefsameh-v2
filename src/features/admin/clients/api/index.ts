// src/features/admin/clients/api/index.ts
import axios from "axios";
import { Client } from "@/app/generated/prisma/client";
import { APIResponse } from "@/lib/types";
import { ClientFormValues, ClientQuery } from "@/validations/clients.validation";
import axiosErrorHandler from "@/lib/axiosErrorHandler";

const api = axios.create({
  baseURL: "/api/admin/clients",
  headers: { "Content-Type": "application/json" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

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

export type ClientsResponse = APIResponse<ClientWithCount[]>;
export type ClientResponse  = APIResponse<ClientWithProjects>;

export type GetClientsParams = Partial<ClientQuery>;

// ─── Fetchers ─────────────────────────────────────────────────────────────────

/**
 * @summary Get all clients (for admin)
 * @param params - Pagination and filter params
 * @returns Paginated clients list with project count
 */
export async function getAdminClients(
  params?: GetClientsParams,
): Promise<ClientsResponse> {
  try {
    const { data } = await api.get<ClientsResponse>("", { params });
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Get a client by ID
 * @param id - The ID of the client
 * @returns The client data with projects
 */
export async function getAdminClient(id: string): Promise<ClientResponse> {
  try {
    const { data } = await api.get<ClientResponse>(`/${id}`);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Create a new client
 * @param payload - The client fields
 * @returns The created client data
 */
export async function createClient(
  payload: ClientFormValues,
): Promise<ClientResponse> {
  try {
    const { data } = await api.post<ClientResponse>("", payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Update a client by ID
 * @param id - The ID of the client
 * @param payload - The updated fields
 * @returns The updated client data
 */
export async function updateClient(
  id: string,
  payload: Partial<ClientFormValues>,
): Promise<ClientResponse> {
  try {
    const { data } = await api.patch<ClientResponse>(`/${id}`, payload);
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Delete a client by ID
 * @param id - The ID of the client
 */
export async function deleteClient(id: string): Promise<void> {
  try {
    await api.delete(`/${id}`);
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}

/**
 * @summary Regenerate access token for a client
 * @param id - The ID of the client
 * @param expiresInDays - Number of days until token expires (default: 30)
 * @returns The updated client with new access token
 */
export async function regenerateClientToken(
  id: string,
  expiresInDays = 30,
): Promise<ClientResponse> {
  try {
    const { data } = await api.put<ClientResponse>(`/${id}`, { expiresInDays });
    return data;
  } catch (err) {
    throw new Error(axiosErrorHandler(err));
  }
}