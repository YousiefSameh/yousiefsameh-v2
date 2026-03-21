import type { NextResponse } from "next/server";

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export type APIErrorResponse = { success: false; error: string };

export type APIResult<T> = NextResponse<APIResponse<T> | APIErrorResponse>;