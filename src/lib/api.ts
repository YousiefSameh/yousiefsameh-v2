// src/lib/api.ts
import { APIErrorResponse, APIResponse } from "./types";
import { NextResponse } from "next/server";

export const apiError = (error: string, status: number) =>
  NextResponse.json({ success: false, error } as APIErrorResponse, { status });

export const apiSuccess = <T>(
  data: T,
  message?: string,
  status = 200,
  pagination?: APIResponse<T>["pagination"],
) =>
  NextResponse.json(
    { success: true, data, message, pagination } as APIResponse<T>,
    { status },
  );
