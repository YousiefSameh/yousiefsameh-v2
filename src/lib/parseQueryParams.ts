import { z } from "zod";

export function parseQueryParams<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams,
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);

  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join(", ");
    return { success: false, error: message };
  }

  return { success: true, data: result.data };
}